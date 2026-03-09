<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Notification extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'user_id',
        'type',
        'source_type',
        'source_id',
        'source_model',
        'title',
        'message',
        'data',
        'read',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'read' => 'boolean',
        'read_at' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeUnread($query)
    {
        return $query->where('read', false);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    public function scopeBySourceType($query, $sourceType)
    {
        return $query->where('source_type', $sourceType);
    }

    public function scopeInspectionNotifications($query)
    {
        return $query->where('source_type', 'inspection');
    }

    public function scopeDriverChecklistNotifications($query)
    {
        return $query->where('source_type', 'driver_checklist');
    }

    public function scopeAdminMessageNotifications($query)
    {
        return $query->where('source_type', 'admin_message');
    }

    public function scopePlatformAdminNotifications($query)
    {
        return $query->where('source_type', 'platform_admin');
    }

    public function markAsRead()
    {
        $this->update([
            'read' => true,
            'read_at' => now(),
        ]);
    }
}
