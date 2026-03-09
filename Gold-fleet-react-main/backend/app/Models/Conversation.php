<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    protected $fillable = [
        'company_id',
        'company_user_id',
        'platform_admin_id',
        'subject',
        'status',
        'message_count',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the company associated with this conversation
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the company admin user
     */
    public function companyUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'company_user_id');
    }

    /**
     * Get the platform admin user
     */
    public function platformAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'platform_admin_id');
    }

    /**
     * Get all messages in this conversation
     */
    public function messages(): HasMany
    {
        return $this->hasMany(ConversationMessage::class)->orderBy('created_at', 'asc');
    }

    /**
     * Get unread messages in this conversation
     */
    public function unreadMessages(): HasMany
    {
        return $this->hasMany(ConversationMessage::class)
            ->where('read', false)
            ->orderBy('created_at', 'asc');
    }

    /**
     * Mark all messages as read for a specific user
     */
    public function markAllAsReadFor(User $user): void
    {
        $this->messages()
            ->where('read', false)
            ->update(['read' => true, 'read_at' => now()]);
    }

    /**
     * Add a new message to the conversation
     */
    public function addMessage(User $sender, string $content): ConversationMessage
    {
        $senderType = $this->isCompanyAdmin($sender) ? 'company_admin' : 'platform_admin';

        $message = $this->messages()->create([
            'sender_id' => $sender->id,
            'sender_type' => $senderType,
            'content' => $content,
        ]);

        // Update conversation metadata
        $this->update([
            'message_count' => $this->messages()->count(),
            'last_message_at' => now(),
        ]);

        return $message;
    }

    /**
     * Check if a user is the company admin
     */
    private function isCompanyAdmin(User $user): bool
    {
        return $user->id === $this->company_user_id;
    }

    /**
     * Get unread count for a specific user
     */
    public function getUnreadCountFor(User $user): int
    {
        return $this->unreadMessages()
            ->where('sender_id', '!=', $user->id)
            ->count();
    }
}
