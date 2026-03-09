<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('company_user_id');
            $table->unsignedBigInteger('platform_admin_id')->nullable();
            
            // Conversation metadata
            $table->string('subject')->nullable();
            $table->enum('status', ['open', 'closed', 'archived'])->default('open');
            $table->unsignedInteger('message_count')->default(0);
            
            // Timestamps
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->foreign('company_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('platform_admin_id')->references('id')->on('users')->onDelete('set null');
            
            // Indexes
            $table->index('company_id');
            $table->index('company_user_id');
            $table->index('platform_admin_id');
            $table->index('status');
            $table->index('last_message_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
