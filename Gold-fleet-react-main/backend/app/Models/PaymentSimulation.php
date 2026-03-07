<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentSimulation extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'company_id',
        'subscription_id',
        'simulated_amount',
        'payment_status',
        'payment_method',
        'payment_date',
        'card_number',
        'expiry_date',
        'cvc',
        'platform_commission',
        'platform_earnings',
        'company_earnings',
        'verified_at',
        'verification_notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'payment_date' => 'datetime',
        'verified_at' => 'datetime',
        'platform_commission' => 'decimal:2',
        'platform_earnings' => 'decimal:2',
        'company_earnings' => 'decimal:2',
        'simulated_amount' => 'decimal:2',
    ];

    /**
     * Get the company associated with this payment simulation.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the subscription associated with this payment simulation.
     */
    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    /**
     * Check if the payment simulation exceeds plan limits.
     */
    public function exceedsLimits(): bool
    {
        $plan = $this->subscription->plan;

        if ($plan->max_vehicles && $this->simulated_vehicles > $plan->max_vehicles) {
            return true;
        }

        if ($plan->max_drivers && $this->simulated_drivers > $plan->max_drivers) {
            return true;
        }

        if ($plan->max_users && $this->simulated_users > $plan->max_users) {
            return true;
        }

        return false;
    }

    /**
     * Get the limit errors for this payment simulation.
     */
    public function getLimitErrors(): array
    {
        $errors = [];
        $plan = $this->subscription->plan;

        if ($plan->max_vehicles && $this->simulated_vehicles > $plan->max_vehicles) {
            $errors[] = "Simulated vehicles ({$this->simulated_vehicles}) exceed plan limit ({$plan->max_vehicles})";
        }

        if ($plan->max_drivers && $this->simulated_drivers > $plan->max_drivers) {
            $errors[] = "Simulated drivers ({$this->simulated_drivers}) exceed plan limit ({$plan->max_drivers})";
        }

        if ($plan->max_users && $this->simulated_users > $plan->max_users) {
            $errors[] = "Simulated users ({$this->simulated_users}) exceed plan limit ({$plan->max_users})";
        }

        return $errors;
    }
}
