<?php

namespace App\Listeners;

use App\Events\CompanyApproved;
use App\Models\Conversation;
use App\Models\Notification;
use App\Models\NotificationPreference;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendCompanyApprovalNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(CompanyApproved $event): void
    {
        $company = $event->company;

        // Get the primary admin/owner user for the company
        $companyAdmin = $company->users()
            ->whereIn('role', ['owner', 'admin'])
            ->first();

        if (!$companyAdmin) {
            return;
        }

        // Find or create a conversation with platform admin for this company
        $conversation = Conversation::where('company_id', $company->id)
            ->where('subject', 'like', '%Approval%')
            ->first();

        if (!$conversation) {
            // Find a platform admin to assign (preferably the one who approved)
            $platformAdmin = \App\Models\User::where('role', 'admin')
                ->where('email', 'like', '%admin%')
                ->first();

            if (!$platformAdmin) {
                $platformAdmin = \App\Models\User::where('role', 'admin')->first();
            }

            $conversation = Conversation::create([
                'company_id' => $company->id,
                'company_user_id' => $companyAdmin->id,
                'platform_admin_id' => $platformAdmin?->id,
                'subject' => 'Company Approval Confirmation',
                'status' => 'open',
                'message_count' => 0,
            ]);
        }

        // Add approval message to conversation
        $conversation->addMessage(
            $companyAdmin->id,
            'platform_admin',
            "Your company '{$company->name}' has been approved! Welcome to Gold Fleet. You can now start managing your vehicles and drivers."
        );

        // Check notification preferences
        $preferences = NotificationPreference::where('company_id', $company->id)->first();

        if ($preferences && $preferences->email_notifications) {
            // Send dashboard notification
            Notification::create([
                'user_id' => $companyAdmin->id,
                'company_id' => $company->id,
                'type' => 'company_approved',
                'title' => 'Company Approved',
                'message' => "Congratulations! Your company '{$company->name}' has been approved.",
                'data' => [
                    'company_id' => $company->id,
                    'conversation_id' => $conversation->id,
                ],
                'read_at' => null,
            ]);
        }
    }
}
