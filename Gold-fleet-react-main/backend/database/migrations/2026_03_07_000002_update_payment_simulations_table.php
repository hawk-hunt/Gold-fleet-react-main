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
            // Add card payment fields
            $table->string('card_number')->nullable()->after('payment_method');
            $table->string('expiry_date')->nullable()->after('card_number');
            $table->string('cvc')->nullable()->after('expiry_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_simulations', function (Blueprint $table) {
            $table->dropColumn(['card_number', 'expiry_date', 'cvc']);
        });
    }
};
