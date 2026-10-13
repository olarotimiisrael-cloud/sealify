<?php

namespace Tests\Feature;

use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SealifyApiTest extends TestCase
{
    use RefreshDatabase;

    private function authToken(): string
    {
        $register = $this->postJson('/api/auth/register', [
            'email' => 'seller@example.test',
            'password' => 'password123',
            'full_name' => 'Test Seller',
            'phone_number' => '08012345678',
        ]);

        $register->assertCreated();

        return $register->json('access_token');
    }

    public function test_registration_returns_access_token_and_user(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'email' => 'newuser@example.test',
            'password' => 'password123',
            'full_name' => 'New User',
        ]);

        $response
            ->assertCreated()
            ->assertJsonStructure([
                'access_token',
                'token_type',
                'user' => ['id', 'email', 'full_name'],
            ]);

        $this->assertDatabaseHas('users', ['email' => 'newuser@example.test']);
    }

    public function test_authenticated_user_can_create_and_view_listing(): void
    {
        $token = $this->authToken();
        $category = Category::create([
            'name' => 'Electronics',
            'slug' => 'electronics',
            'is_active' => true,
        ]);

        $create = $this->withToken($token)->postJson('/api/listings', [
            'title' => 'iPhone 12 Pro',
            'description' => 'Clean iPhone 12 Pro with battery health good.',
            'price' => 350000,
            'category_id' => $category->id,
            'condition' => 'Used - Good',
            'location' => 'Ogbomoso',
            'images' => ['https://example.com/phone.jpg'],
        ]);

        $create
            ->assertCreated()
            ->assertJsonPath('title', 'iPhone 12 Pro')
            ->assertJsonPath('status', 'active');

        $listingId = $create->json('id');

        $this->getJson('/api/listings')
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('listings.0.seller_name', 'Test Seller');

        $this->getJson("/api/listings/{$listingId}")
            ->assertOk()
            ->assertJsonPath('id', $listingId);
    }

    public function test_listing_creation_requires_authentication(): void
    {
        $this->postJson('/api/listings', [
            'title' => 'iPhone 12 Pro',
            'description' => 'Clean iPhone 12 Pro with battery health good.',
            'price' => 350000,
            'category_id' => 1,
            'condition' => 'Used - Good',
            'location' => 'Ogbomoso',
            'images' => ['https://example.com/phone.jpg'],
        ])->assertUnauthorized();
    }

    public function test_copilot_returns_configured_provider_message_when_no_ai_key_is_set(): void
    {
        config()->set('AI_PROVIDER', 'openai');

        $this->postJson('/api/copilot', [
            'message' => 'How does Sealify work?',
            'conversation' => [],
        ])
            ->assertOk()
            ->assertJsonPath('usedWebSearch', false);
    }
}
