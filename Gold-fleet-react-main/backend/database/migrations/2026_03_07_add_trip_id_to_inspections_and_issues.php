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
        Schema::table('inspections', function (Blueprint $table) {
            $table->foreignId('trip_id')->nullable()->constrained()->onDelete('set null')->after('driver_id');
        });

        Schema::table('issues', function (Blueprint $table) {
            $table->foreignId('trip_id')->nullable()->constrained()->onDelete('set null')->after('driver_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inspections', function (Blueprint $table) {
            $table->dropForeignKey(['trip_id']);
            $table->dropColumn('trip_id');
        });

        Schema::table('issues', function (Blueprint $table) {
            $table->dropForeignKey(['trip_id']);
            $table->dropColumn('trip_id');
        });
    }
};
