<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mobile_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('device_type')->default('mobile');
            $table->string('device_model')->nullable();
            $table->string('app_version')->nullable();
            $table->string('os_version')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('last_active')->nullable();
            $table->text('push_token')->nullable();
            $table->string('push_provider')->nullable();
            $table->string('locale', 10)->default('en');
            $table->string('currency', 3)->default('USD');
            $table->boolean('is_online')->default(true);
            $table->timestamps();
            
            $table->index(['user_id', 'is_online']);
            $table->index('push_token');
        });
        
        Schema::create('mobile_push_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('title')->nullable();
            $table->text('body')->nullable();
            $table->json('data')->nullable();
            $table->string('priority')->default('normal');
            $table->enum('status', ['pending', 'sent', 'delivered', 'read', 'failed'])->default('pending');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
        });
        
        Schema::create('mobile_offline_sync', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->json('data');
            $table->string('status')->default('pending');
            $table->text('errors')->nullable();
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
        });
    }
    
    public function down(): void
    {
        Schema::dropIfExists('mobile_offline_sync');
        Schema::dropIfExists('mobile_push_notifications');
        Schema::dropIfExists('mobile_sessions');
    }
};
