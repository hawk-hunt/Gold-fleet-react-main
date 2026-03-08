<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConversationMessage extends Model
{
    protected $fillable = [
        'conversation_id',
        'sender_id',
        'sender_type',
        'content',
        'read',
        'read_at',
    ];

    protected $casts = [
        'read' => 'boolean',
        'read_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the conversation this message belongs to
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * Get the sender user
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Mark this message as read
     */
    public function markAsRead(): void
    {
        if (!$this->read) {
            $this->update([
                'read' => true,
                'read_at' => now(),
            ]);
        }
    }

    /**
     * Determine if sender is company admin
     */
    public function isFromCompanyAdmin(): bool
    {
        return $this->sender_type === 'company_admin';
    }

    /**
     * Determine if sender is platform admin
     */
    public function isFromPlatformAdmin(): bool
    {
        return $this->sender_type === 'platform_admin';
    }
}
