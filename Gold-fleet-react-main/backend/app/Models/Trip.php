<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Trip extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'vehicle_id',
        'driver_id',
        'start_time',
        'end_time',
        'start_mileage',
        'end_mileage',
        'distance',
        'status',
        'notes',
        'start_location',
        'end_location',
        'trip_date',
        'origin_lat',
        'origin_lng',
        'destination_lat',
        'destination_lng',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'start_mileage' => 'decimal:2',
        'end_mileage' => 'decimal:2',
        'distance' => 'decimal:2',
        'origin_lat' => 'decimal:8',
        'origin_lng' => 'decimal:8',
        'destination_lat' => 'decimal:8',
        'destination_lng' => 'decimal:8',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    /**
     * Get the simulation state for this trip.
     * One trip can have at most one simulation.
     */
    public function simulation(): HasOne
    {
        return $this->hasOne(TripSimulation::class);
    }

    /**
     * Check if this trip has an active simulation running.
     */
    public function hasActiveSimulation(): bool
    {
        return $this->simulation()->where('is_active', true)->exists();
    }

    /**
     * Get coordinates as an array pair.
     */
    public function getOriginCoordinates(): array
    {
        return [
            'latitude' => $this->origin_lat,
            'longitude' => $this->origin_lng,
        ];
    }

    public function getDestinationCoordinates(): array
    {
        return [
            'latitude' => $this->destination_lat,
            'longitude' => $this->destination_lng,
        ];
    }
}
