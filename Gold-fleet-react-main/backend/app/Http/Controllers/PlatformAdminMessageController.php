<?php

namespace App\Http\Controllers;

use App\Models\PlatformAdminMessage;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class PlatformAdminMessageController extends Controller
{
    /**
     * Get all platform admin messages for a company
     * GET /api/platform-admin-messages
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        
        // Only company admins can view platform admin messages
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $messages = PlatformAdminMessage::forCompany($user->company_id)
            ->forUser($user->id)
            ->with('fromUser', 'company')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $unreadCount = PlatformAdminMessage::forCompany($user->company_id)
            ->forUser($user->id)
            ->unread()
            ->count();

        return response()->json([
            'success' => true,
            'data' => $messages,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Get a specific platform admin message
     * GET /api/platform-admin-messages/{id}
     */
    public function show(PlatformAdminMessage $message): JsonResponse
    {
        $user = auth()->user();

        // Check if user has access to this message
        if ($message->company_id !== $user->company_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($message->to_user_id !== null && $message->to_user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Mark as read if not already
        if ($message->status === 'sent' && ($message->to_user_id === $user->id || $message->to_user_id === null)) {
            $message->markAsRead();
        }

        return response()->json([
            'success' => true,
            'data' => $message->load('fromUser', 'company'),
        ]);
    }

    /**
     * Send a platform admin message to company admin(s)
     * POST /api/platform-admin-messages
     * Requires: platform admin role
     */
    public function store(Request $request): JsonResponse
    {
        $user = auth()->user();

        // Only platform admins can send these messages
        if ($user->role !== 'admin' || !$this->isPlatformAdmin($user)) {
            return response()->json([
                'success' => false,
                'message' => 'Only platform admins can send these messages',
            ], 403);
        }

        try {
            $validated = $request->validate([
                'company_id' => 'required|exists:companies,id',
                'to_user_id' => 'nullable|exists:users,id',
                'subject' => 'required|string|max:255',
                'message' => 'required|string',
                'attachments' => 'nullable|array',
            ]);

            $message = PlatformAdminMessage::create([
                'company_id' => $validated['company_id'],
                'from_user_id' => $user->id,
                'to_user_id' => $validated['to_user_id'] ?? null,
                'subject' => $validated['subject'],
                'message' => $validated['message'],
                'attachments' => $validated['attachments'] ?? null,
            ]);

            // Create notifications for all company admins (if to_user_id is null) or specific user
            $this->notifyCompanyAdminsOfMessage($message);

            return response()->json([
                'success' => true,
                'message' => 'Message sent successfully',
                'data' => $message->load('fromUser'),
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to send platform admin message: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message',
            ], 500);
        }
    }

    /**
     * Mark a message as read
     * PATCH /api/platform-admin-messages/{id}/read
     */
    public function markAsRead(PlatformAdminMessage $message): JsonResponse
    {
        $user = auth()->user();

        // Check authorization
        if ($message->company_id !== $user->company_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($message->to_user_id !== null && $message->to_user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $message->markAsRead();

        return response()->json([
            'success' => true,
            'data' => $message,
        ]);
    }

    /**
     * Delete a message
     * DELETE /api/platform-admin-messages/{id}
     */
    public function destroy(PlatformAdminMessage $message): JsonResponse
    {
        $user = auth()->user();

        // Check authorization
        if ($message->company_id !== $user->company_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $message->delete();

        return response()->json([
            'success' => true,
            'message' => 'Message deleted successfully',
        ]);
    }

    /**
     * Create notifications for company admins about platform admin message
     */
    private function notifyCompanyAdminsOfMessage(PlatformAdminMessage $platformMessage)
    {
        try {
            if ($platformMessage->to_user_id !== null) {
                // Message to specific user
                $admins = User::where('id', $platformMessage->to_user_id)->get();
            } else {
                // Message to all company admins
                $admins = User::where('company_id', $platformMessage->company_id)
                    ->where('role', 'admin')
                    ->get();
            }

            foreach ($admins as $admin) {
                Notification::create([
                    'company_id' => $platformMessage->company_id,
                    'user_id' => $admin->id,
                    'type' => 'platform_admin_message',
                    'source_type' => 'platform_admin',
                    'source_id' => $platformMessage->id,
                    'source_model' => 'PlatformAdminMessage',
                    'title' => 'Message from Platform Admin',
                    'message' => $platformMessage->subject,
                    'data' => [
                        'message_id' => $platformMessage->id,
                        'from_user' => $platformMessage->fromUser->name,
                        'subject' => $platformMessage->subject,
                        'preview' => substr($platformMessage->message, 0, 100) . '...',
                        'action_url' => "/admin/messages/{$platformMessage->id}",
                    ],
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to notify company admins of platform message: ' . $e->getMessage());
        }
    }

    /**
     * Check if user is a platform admin by checking if they have no company_id
     */
    private function isPlatformAdmin(User $user): bool
    {
        // Platform admins typically have no company_id set
        return $user->company_id === null;
    }
}
