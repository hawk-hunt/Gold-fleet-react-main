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
        Schema::table('companies', function (Blueprint $table) {
            $table->string('city')->nullable()->after('address');
            $table->string('state')->nullable()->after('city');
            $table->string('zip')->nullable()->after('state');
            $table->string('country')->nullable()->after('zip');
            $table->string('industry')->nullable()->after('country');
            $table->integer('fleet_size')->default(0)->after('industry');
            $table->integer('num_employees')->default(0)->after('fleet_size');
            $table->string('subscription_plan')->default('basic')->after('num_employees');
            $table->string('subscription_status')->default('active')->after('subscription_plan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn([
                'city',
                'state',
                'zip',
                'country',
                'industry',
                'fleet_size',
                'num_employees',
                'subscription_plan',
                'subscription_status',
            ]);
        });
    }
};
