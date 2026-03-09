<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Create trip_simulations table to track real-time vehicle movement simulation.
     * This table maintains the current state of a simulated trip being executed.
     * One active simulation per trip at any given time.
     */
    public function up(): void
    {
        Schema::create('trip_simulations', function (Blueprint $table) {
            $table->id();
            
            // Foreign key to trips table - cascade delete if trip is deleted
            $table->foreignId('trip_id')->unique()->constrained('trips')->onDelete('cascade')->comment('Associated trip being simulated');
            
            // Simulation control
            $table->boolean('is_active')->default(false)->comment('Whether this simulation is currently running');
            
            // Current position during simulation
            $table->decimal('current_lat', 10, 8)->nullable()->comment('Current simulated latitude during movement');
            $table->decimal('current_lng', 11, 8)->nullable()->comment('Current simulated longitude during movement');
            
            // Simulation progress tracking
            $table->integer('segment_index')->default(0)->comment('Current segment index in the route');
            $table->decimal('progress_percentage', 5, 2)->default(0)->comment('Percentage of route completed (0-100)');
            $table->decimal('speed_kmh', 5, 2)->default(60)->comment('Simulated speed in km/h');
            $table->decimal('heading', 5, 2)->nullable()->comment('Direction in degrees (0-360)');
            
            // Timing
            $table->timestamp('started_at')->nullable()->comment('When simulation started');
            $table->timestamp('completed_at')->nullable()->comment('When simulation completed');
            $table->timestamps();
            
            // Indexes for faster queries
            $table->index('is_active');
            $table->index('trip_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trip_simulations');
    }
};
