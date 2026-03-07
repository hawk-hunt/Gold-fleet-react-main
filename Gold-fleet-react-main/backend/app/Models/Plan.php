<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    /**
     * The attributes that are mass assignable.
     * 
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'description',
        'price',
        'trial_days',
        'max_vehicles',
        'max_drivers',
        'max_users',
        'has_analytics',
        'has_map_tracking',
        'has_maintenance_tracking',
        'has_expense_tracking',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
        'has_analytics' => 'boolean',
        'has_map_tracking' => 'boolean',
        'has_maintenance_tracking' => 'boolean',
        'has_expense_tracking' => 'boolean',
    ];

    /**
     * Get subscriptions for this plan.
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }
}
