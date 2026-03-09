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
        Schema::table('notifications', function (Blueprint $table) {
            // Add source_type to track notification source
            // Values: inspection, driver_checklist, admin_message, platform_admin, system
            $table->string('source_type')->default('system')->after('type');
            $table->unsignedBigInteger('source_id')->nullable()->after('source_type'); // ID of source entity
            $table->string('source_model')->nullable()->after('source_id'); // Model name (Inspection, etc)
            
            // Add index for filtering by source
            $table->index(['company_id', 'source_type', 'read']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['company_id', 'source_type', 'read']);
            $table->dropColumn(['source_type', 'source_id', 'source_model']);
        });
    }
};
