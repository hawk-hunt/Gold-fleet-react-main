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
        Schema::table('payment_simulations', function (Blueprint $table) {
            // Payment tracking fields
            $table->string('payment_status')->default('pending'); // pending, verified, completed, failed
            $table->decimal('platform_commission', 10, 2)->default(0); // Platform percentage (e.g., 20% = 0.20)
            $table->decimal('platform_earnings', 10, 2)->default(0); // Amount platform earns
            $table->decimal('company_earnings', 10, 2)->default(0); // Amount company pays (actual subscription amount)
            $table->timestamp('verified_at')->nullable(); // When payment was verified
            $table->string('verification_notes')->nullable(); // Payment verification notes
            $table->timestamps(); // created_at and updated_at if not already present
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_simulations', function (Blueprint $table) {
            $table->dropColumn([
                'payment_status',
                'platform_commission',
                'platform_earnings',
                'company_earnings',
                'verified_at',
                'verification_notes'
            ]);
        });
    }
};
