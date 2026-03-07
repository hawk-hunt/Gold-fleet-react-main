<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('description')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->integer('trial_days')->default(12);
            $table->integer('max_vehicles')->nullable();
            $table->integer('max_drivers')->nullable();
            $table->integer('max_users')->nullable();
            $table->boolean('has_analytics')->default(true);
            $table->boolean('has_map_tracking')->default(true);
            $table->boolean('has_maintenance_tracking')->default(true);
            $table->boolean('has_expense_tracking')->default(true);
            $table->string('status')->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
