<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * TripSimulation Model
 * 
 * Tracks the real-time simulation state of a vehicle moving along a trip route.
 * Maintains current position, progress, and timing information during active simulation.
 * 
 * @property int $id
 * @property int $trip_id - Associated trip ID
 * @property bool $is_active - Whether simulation is currently running
 * @property float $current_lat - Current latitude during simulation
 * @property float $current_lng - Current longitude during simulation
 * @property int $segment_index - Current segment in the polyline route
 * @property float $progress_percentage - Route completion percentage (0-100)
 * @property float $speed_kmh - Simulated speed in km/h
 * @property float $heading - Direction in degrees (0-360)
 * @property \Illuminate\Support\Carbon $started_at
 * @property \Illuminate\Support\Carbon $completed_at
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class TripSimulation extends Model
{
    protected $table = 'trip_simulations';

    protected $fillable = [
        'trip_id',
        'is_active',
        'current_lat',
        'current_lng',
        'segment_index',
        'progress_percentage',
        'speed_kmh',
        'heading',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'current_lat' => 'decimal:8',
        'current_lng' => 'decimal:8',
        'progress_percentage' => 'decimal:2',
        'speed_kmh' => 'decimal:2',
        'heading' => 'decimal:2',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the trip this simulation belongs to.
     */
    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }

    /**
     * Check if the simulation is currently active.
     */
    public function isRunning(): bool
    {
        return $this->is_active && !$this->completed_at;
    }

    /**
     * Calculate progress percentage based on segment index.
     * Assumes a precomputed route polyline.
     */
    public function calculateProgress(int $totalSegments): float
    {
        if ($totalSegments === 0) {
            return 0;
        }
        return round(($this->segment_index / $totalSegments) * 100, 2);
    }

    /**
     * Mark simulation as completed.
     */
    public function markCompleted(): void
    {
        $this->is_active = false;
        $this->progress_percentage = 100;
        $this->completed_at = now();
        $this->save();

        // Update associated trip status
        if ($this->trip) {
            $this->trip->update(['status' => 'completed']);
        }
    }

    /**
     * Get the current position as an array.
     */
    public function getCurrentPosition(): array
    {
        return [
            'latitude' => $this->current_lat,
            'longitude' => $this->current_lng,
            'speed' => $this->speed_kmh,
            'heading' => $this->heading,
            'progress' => $this->progress_percentage,
        ];
    }
}
