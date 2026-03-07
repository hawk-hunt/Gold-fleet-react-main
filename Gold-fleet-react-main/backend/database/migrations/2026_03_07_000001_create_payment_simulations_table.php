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
        Schema::create('payment_simulations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained();
            $table->foreignId('subscription_id')->constrained();
            $table->integer('simulated_vehicles')->default(0);
            $table->integer('simulated_drivers')->default(0);
            $table->integer('simulated_users')->default(0);
            $table->decimal('simulated_amount', 10, 2)->nullable();
            $table->string('payment_status')->default('pending'); // pending, completed, failed
            $table->string('payment_method')->nullable(); // credit_card, bank_transfer, etc.
            $table->dateTime('payment_date')->nullable();
            $table->dateTime('due_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_simulations');
    }
};
