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
        Schema::table('issues', function (Blueprint $table) {
            $table->string('photo_path')->nullable()->after('priority');
            $table->text('resolution_notes')->nullable()->after('photo_path');
            $table->string('assigned_mechanic_id')->nullable()->after('resolution_notes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('issues', function (Blueprint $table) {
            $table->dropColumn(['photo_path', 'resolution_notes', 'assigned_mechanic_id']);
        });
    }
};
