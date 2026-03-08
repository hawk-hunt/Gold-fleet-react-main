<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Company extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'zip',
        'country',
        'industry',
        'fleet_size',
        'num_employees',
        'subscription_plan',
        'subscription_status',
        'status',
        'is_active',
        'access_code',
        'account_status',
        'company_status',
        'approved_at',
        'approved_by',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class);
    }

    public function drivers(): HasMany
    {
        return $this->hasMany(Driver::class);
    }

    public function trips(): HasMany
    {
        return $this->hasMany(Trip::class);
    }

    public function vehicleLocations(): HasMany
    {
        return $this->hasMany(VehicleLocation::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function inspections(): HasMany
    {
        return $this->hasMany(Inspection::class);
    }

    public function issues(): HasMany
    {
        return $this->hasMany(Issue::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function fuelFillups(): HasMany
    {
        return $this->hasMany(FuelFillup::class);
    }

    public function reminders(): HasMany
    {
        return $this->hasMany(Reminder::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function paymentSimulations(): HasMany
    {
        return $this->hasMany(PaymentSimulation::class);
    }

    /**
     * Get the user who approved this company.
     */
    public function approvedByUser()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Check if the company account is verified.
     */
    public function isAccountVerified(): bool
    {
        return $this->account_status === 'verified';
    }

    /**
     * Check if the company is approved by admin.
     */
    public function isApproved(): bool
    {
        return $this->company_status === 'approved';
    }

    /**
     * Check if the subscription is active.
     */
    public function hasActiveSubscription(): bool
    {
        return $this->subscription_status === 'active';
    }

    /**
     * Check if company has full access (verified + approved + active subscription).
     */
    public function hasFullAccess(): bool
    {
        return $this->isAccountVerified() && $this->isApproved() && $this->hasActiveSubscription();
    }

    /**
     * Approve the company for full feature access.
     */
    public function approveCompany(User $approver): void
    {
        $this->update([
            'company_status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $approver->id,
        ]);
    }

    /**
     * Reject the company application.
     */
    public function rejectCompany(User $rejector): void
    {
        $this->update([
            'company_status' => 'rejected',
            'approved_at' => now(),
            'approved_by' => $rejector->id,
        ]);
    }
}
