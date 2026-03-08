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
            // Add verification and approval columns if they don't exist
            if (!Schema::hasColumn('companies', 'account_status')) {
                $table->string('account_status')->default('unverified')->after('status');
            }
            if (!Schema::hasColumn('companies', 'company_status')) {
                $table->string('company_status')->default('pending')->after('account_status');
            }
            if (!Schema::hasColumn('companies', 'subscription_status')) {
                $table->string('subscription_status')->default('none')->after('company_status');
            }
            if (!Schema::hasColumn('companies', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('subscription_status');
            }
            if (!Schema::hasColumn('companies', 'approved_by')) {
                $table->unsignedBigInteger('approved_by')->nullable()->after('approved_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn([
                'account_status',
                'company_status',
                'subscription_status',
                'approved_at',
                'approved_by',
            ]);
        });
    }
};
