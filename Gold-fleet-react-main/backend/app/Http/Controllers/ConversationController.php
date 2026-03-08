<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\ConversationMessage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ConversationController extends Controller
{
    /**
     * Get conversations for company admin
     */
    public function indexForCompanyAdmin(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user || !$user->company_id) {
                return response()->json([
                    'message' => 'User must be part of a company'
                ], 400);
            }

            $conversations = Conversation::where('company_id', $user->company_id)
                ->where('company_user_id', $user->id)
                ->with(['platformAdmin', 'messages' => function ($query) {
                    $query->latest()->limit(1);
                }])
                ->orderByDesc('last_message_at')
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $conversations->items(),
                'pagination' => [
                    'total' => $conversations->total(),
                    'current_page' => $conversations->currentPage(),
                    'last_page' => $conversations->lastPage(),
                    'per_page' => $conversations->perPage(),
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching conversations for company admin: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch conversations'
            ], 500);
        }
    }

    /**
     * Get conversations for platform admin
     */
    public function indexForPlatformAdmin(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if ($user->role !== 'owner') {
                return response()->json([
                    'message' => 'Only platform admins can access this'
                ], 403);
            }

            $conversations = Conversation::with(['company', 'companyUser', 'messages' => function ($query) {
                $query->latest()->limit(1);
            }])
                ->orderByDesc('last_message_at')
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $conversations->items(),
                'pagination' => [
                    'total' => $conversations->total(),
                    'current_page' => $conversations->currentPage(),
                    'last_page' => $conversations->lastPage(),
                    'per_page' => $conversations->perPage(),
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching conversations for platform admin: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch conversations'
            ], 500);
        }
    }

    /**
     * Get a specific conversation with its messages
     */
    public function show(Request $request, Conversation $conversation): JsonResponse
    {
        try {
            $user = $request->user();

            // Verify user has access to this conversation
            if ($conversation->company_user_id !== $user->id && $user->role !== 'owner') {
                return response()->json([
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Mark all messages as read for this user
            $conversation->messages()
                ->where('read', false)
                ->where('sender_id', '!=', $user->id)
                ->update(['read' => true, 'read_at' => now()]);

            $messages = $conversation->messages()
                ->with('sender')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'conversation' => $conversation,
                    'messages' => $messages
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching conversation: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch conversation'
            ], 500);
        }
    }

    /**
     * Send a message in a conversation
     */
    public function sendMessage(Request $request, Conversation $conversation): JsonResponse
    {
        try {
            $user = $request->user();

            // Verify user has access to this conversation
            if ($conversation->company_user_id !== $user->id && $user->role !== 'owner') {
                return response()->json([
                    'message' => 'Unauthorized'
                ], 403);
            }

            $validated = $request->validate([
                'content' => 'required|string|min:1|max:5000'
            ]);

            $message = $conversation->addMessage($user, $validated['content']);
            $message->load('sender');

            return response()->json([
                'success' => true,
                'message' => 'Message sent successfully',
                'data' => $message
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error sending message: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to send message'
            ], 500);
        }
    }

    /**
     * Create a new conversation (company admin initiating contact)
     */
    public function createForCompanyAdmin(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user->company_id) {
                return response()->json([
                    'message' => 'User must be part of a company'
                ], 400);
            }

            $validated = $request->validate([
                'subject' => 'required|string|max:255',
                'content' => 'required|string|min:1|max:5000'
            ]);

            // Check if conversation already exists for this company
            $existing = Conversation::where('company_id', $user->company_id)
                ->where('company_user_id', $user->id)
                ->where('status', '!=', 'closed')
                ->first();

            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'You already have an open conversation. Use it to send messages.',
                    'data' => $existing
                ], 400);
            }

            // Create new conversation
            $conversation = Conversation::create([
                'company_id' => $user->company_id,
                'company_user_id' => $user->id,
                'subject' => $validated['subject'],
            ]);

            // Add first message
            $conversation->addMessage($user, $validated['content']);
            $conversation->load('messages.sender');

            return response()->json([
                'success' => true,
                'message' => 'Conversation created successfully',
                'data' => $conversation
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error creating conversation: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create conversation'
            ], 500);
        }
    }

    /**
     * Assign conversation to platform admin
     */
    public function assignToPlatformAdmin(Request $request, Conversation $conversation): JsonResponse
    {
        try {
            $user = $request->user();

            if ($user->role !== 'owner') {
                return response()->json([
                    'message' => 'Only platform admins can assign conversations'
                ], 403);
            }

            $conversation->update([
                'platform_admin_id' => $user->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Conversation assigned successfully',
                'data' => $conversation
            ]);
        } catch (\Exception $e) {
            \Log::error('Error assigning conversation: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to assign conversation'
            ], 500);
        }
    }

    /**
     * Close a conversation
     */
    public function closeConversation(Request $request, Conversation $conversation): JsonResponse
    {
        try {
            $user = $request->user();

            // Verify user has access to close this
            if ($conversation->company_user_id !== $user->id && $user->role !== 'owner') {
                return response()->json([
                    'message' => 'Unauthorized'
                ], 403);
            }

            $conversation->update(['status' => 'closed']);

            return response()->json([
                'success' => true,
                'message' => 'Conversation closed successfully',
                'data' => $conversation
            ]);
        } catch (\Exception $e) {
            \Log::error('Error closing conversation: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to close conversation'
            ], 500);
        }
    }

    /**
     * Get unread conversation count
     */
    public function getUnreadCount(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if ($user->role === 'owner') {
                // Platform admin: count conversations with unread messages they didn't send
                $unreadCount = Conversation::withCount([
                    'unreadMessages' => function ($query) use ($user) {
                        $query->where('sender_id', '!=', $user->id);
                    }
                ])
                    ->having('unread_messages_count', '>', 0)
                    ->count();
            } else {
                // Company admin: count their conversations with unread messages from platform admin
                $unreadCount = Conversation::where('company_user_id', $user->id)
                    ->withCount([
                        'unreadMessages' => function ($query) use ($user) {
                            $query->where('sender_id', '!=', $user->id);
                        }
                    ])
                    ->having('unread_messages_count', '>', 0)
                    ->count();
            }

            return response()->json([
                'success' => true,
                'unread_count' => $unreadCount
            ]);
        } catch (\Exception $e) {
            \Log::error('Error getting unread count: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to get unread count'
            ], 500);
        }
    }
}
