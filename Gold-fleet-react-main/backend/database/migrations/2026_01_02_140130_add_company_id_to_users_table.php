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
        // This migration is now handled by earlier migrations
        // (add_api_token_to_users_table adds the column)
        // and 2026_02_15_000003_add_company_id_foreign_key adds the constraint
        // This is kept for backwards compatibility only
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op for backwards compatibility
    }
};
