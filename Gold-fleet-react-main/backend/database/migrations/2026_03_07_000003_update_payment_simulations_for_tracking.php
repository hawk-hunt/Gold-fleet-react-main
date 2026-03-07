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
            // Only add columns that don't exist
            if (!Schema::hasColumn('payment_simulations', 'platform_commission')) {
                $table->decimal('platform_commission', 10, 2)->default(0);
            }
            if (!Schema::hasColumn('payment_simulations', 'platform_earnings')) {
                $table->decimal('platform_earnings', 10, 2)->default(0);
            }
            if (!Schema::hasColumn('payment_simulations', 'company_earnings')) {
                $table->decimal('company_earnings', 10, 2)->default(0);
            }
            if (!Schema::hasColumn('payment_simulations', 'verified_at')) {
                $table->timestamp('verified_at')->nullable();
            }
            if (!Schema::hasColumn('payment_simulations', 'verification_notes')) {
                $table->string('verification_notes')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_simulations', function (Blueprint $table) {
            $table->dropColumnIfExists('platform_commission');
            $table->dropColumnIfExists('platform_earnings');
            $table->dropColumnIfExists('company_earnings');
            $table->dropColumnIfExists('verified_at');
            $table->dropColumnIfExists('verification_notes');
        });
    }
};
