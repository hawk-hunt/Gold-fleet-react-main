<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add GPS coordinates to trips table for simulation features.
     * These columns store the origin and destination coordinates in decimal degrees.
     * Compatible with Leaflet.js and OpenStreetMap coordinate system.
     */
    public function up(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            // Origin coordinates (starting point of trip)
            $table->decimal('origin_lat', 10, 8)->nullable()->after('trip_date')->comment('Origin latitude in decimal degrees');
            $table->decimal('origin_lng', 11, 8)->nullable()->after('origin_lat')->comment('Origin longitude in decimal degrees');
            
            // Destination coordinates (ending point of trip)
            $table->decimal('destination_lat', 10, 8)->nullable()->after('origin_lng')->comment('Destination latitude in decimal degrees');
            $table->decimal('destination_lng', 11, 8)->nullable()->after('destination_lat')->comment('Destination longitude in decimal degrees');
            
            // Index for faster queries on coordinates
            $table->index(['origin_lat', 'origin_lng']);
            $table->index(['destination_lat', 'destination_lng']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->dropIndex(['origin_lat', 'origin_lng']);
            $table->dropIndex(['destination_lat', 'destination_lng']);
            $table->dropColumn([
                'origin_lat',
                'origin_lng',
                'destination_lat',
                'destination_lng'
            ]);
        });
    }
};
