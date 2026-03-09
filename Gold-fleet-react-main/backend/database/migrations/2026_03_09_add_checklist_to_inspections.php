<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add checklist fields for driver-submitted maintenance inspections
     */
    public function up(): void
    {
        Schema::table('inspections', function (Blueprint $table) {
            // Track if inspection was submitted by driver via checklist
            $table->boolean('submitted_by_driver')->default(false)->after('status');
            
            // Store checklist items as JSON (array of {name, checked, notes})
            $table->json('checklist_items')->nullable()->after('submitted_by_driver');
            
            // Track submission timestamp
            $table->timestamp('submitted_at')->nullable()->after('checklist_items');
            
            // Track if inspection has been reviewed by admin
            $table->boolean('admin_reviewed')->default(false)->after('submitted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inspections', function (Blueprint $table) {
            $table->dropColumn([
                'submitted_by_driver',
                'checklist_items',
                'submitted_at',
                'admin_reviewed',
            ]);
        });
    }
};
