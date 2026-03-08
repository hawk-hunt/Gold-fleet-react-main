<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversation_messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('conversation_id');
            $table->unsignedBigInteger('sender_id');
            $table->enum('sender_type', ['company_admin', 'platform_admin']);
            
            // Message content
            $table->longText('content');
            $table->boolean('read')->default(false);
            $table->timestamp('read_at')->nullable();
            
            // Timestamps
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('conversation_id')->references('id')->on('conversations')->onDelete('cascade');
            $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
            
            // Indexes
            $table->index('conversation_id');
            $table->index('sender_id');
            $table->index('sender_type');
            $table->index('read');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversation_messages');
    }
};
