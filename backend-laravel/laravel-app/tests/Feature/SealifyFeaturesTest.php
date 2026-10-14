<?php

namespace Tests\Feature;

use App\Services\UserSafetyService;
use App\Models\Category;
use App\Models\Conversation;
use App\Models\Listing;
use App\Models\ProfileStory;
use App\Models\Report;
use App\Models\User;
use App\Models\VideoRecording;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class SealifyFeaturesTest extends TestCase
{
    use RefreshDatabase;

    private function register(array $overrides = []): User
    {
        $email = $overrides['email'] ?? ('u_'.Str::random(8).'@example.test');

        $res = $this->postJson('/api/auth/register', array_merge([
            'email' => $email,
            'password' => 'password123',
            'full_name' => 'Feature User',
            'phone_number' => '08012345678',
        ], $overrides));

        $res->assertCreated();

        $user = User::where('email', $email)->firstOrFail();
        $user->token = $res->json('access_token');

        return $user;
    }

    public function test_live_text_chat_persists_message(): void
    {
        $seller = $this->register();
        $buyer = $this->register();

        $category = Category::create(['name' => 'Electronics', 'slug' => 'electronics', 'is_active' => true]);
        $ad = Listing::create([
            'seller_id' => $seller->id,
            'category_id' => $category->id,
            'title' => 'iPhone 14',
            'description' => 'Clean device',
            'price' => 400000,
            'condition' => 'Used - Good',
            'location' => 'Lagos',
            'status' => 'active',
            'images' => ['https://example.com/x.jpg'],
        ]);

        $conversation = Conversation::create([
            'ad_id' => $ad->id,
            'participant_1' => $seller->id,
            'participant_2' => $buyer->id,
            'last_message_time' => now(),
        ]);

        $this->withToken($seller->token)
            ->postJson("/api/conversations/{$conversation->id}/messages", ['content' => 'Hi, is this available?'])
            ->assertCreated();

        $this->assertDatabaseHas('messages', [
            'conversation_id' => $conversation->id,
            'sender_id' => $seller->id,
            'content' => 'Hi, is this available?',
        ]);
    }

    public function test_video_call_turn_credentials_and_recording_summary(): void
    {
        $initiator = $this->register();
        $participant = $this->register();

        $start = $this->withToken($initiator->token)
            ->postJson('/api/video/initiate', ['participant_id' => $participant->id]);

        $start->assertCreated();
        $roomId = $start->json('room.id');
        $this->assertDatabaseHas('video_rooms', ['id' => $roomId]);

        $this->withToken($initiator->token)
            ->getJson("/api/video/turn-credentials/{$roomId}")
            ->assertOk()
            ->assertJsonStructure(['iceServers', 'ttl']);

        $this->withToken($initiator->token)
            ->postJson("/api/video/signal/{$roomId}", ['type' => 'offer', 'payload' => ['sdp' => 'test']])
            ->assertOk();

        $rec = $this->withToken($initiator->token)
            ->postJson("/api/video/start-recording/{$roomId}");
        $rec->assertCreated();
        $recordingId = $rec->json('recording.id');
        $this->assertDatabaseHas('video_recordings', ['id' => $recordingId, 'status' => 'recording']);

        $this->withToken($initiator->token)
            ->postJson("/api/video/stop-recording/{$recordingId}")
            ->assertOk();

        $recording = VideoRecording::find($recordingId);
        $this->assertEquals('completed', $recording->status);
        $this->assertNotEmpty($recording->ai_summary);
    }

    public function test_safety_warning_flags_frequently_reported_account(): void
    {
        $target = $this->register();

        foreach ([1, 2, 3] as $reporterId) {
            Report::create([
                'reporter_id' => $reporterId,
                'reported_id' => $target->id,
                'reason' => 'spam',
                'status' => 'pending',
            ]);
        }

        $service = app(UserSafetyService::class);
        \Illuminate\Support\Facades\Cache::forget("user_safety_risk_{$target->id}");
        $status = $service->analyzeUserRisk($target->id);

        $this->assertContains($status['risk_level'], ['medium', 'high', 'critical']);

        $info = $service->getConversationSafetyInfo($target->id, $target->id);
        $this->assertTrue($info['should_warn']);
    }

    public function test_report_endpoint_stores_reported_user(): void
    {
        $reporter = $this->register();
        $reported = $this->register();

        $this->withToken($reporter->token)
            ->postJson("/api/safety/report/{$reported->id}", ['reason' => 'spam', 'details' => 'bad behaviour'])
            ->assertCreated();

        $this->assertDatabaseHas('reports', [
            'reporter_id' => $reporter->id,
            'reported_id' => $reported->id,
            'reason' => 'spam',
        ]);
    }

    public function test_profile_interests_skills_and_stories(): void
    {
        $user = $this->register();

        $this->withToken($user->token)
            ->postJson('/api/profile/interests', ['interests' => ['Phones', 'Laptops']])
            ->assertOk();
        $this->assertDatabaseHas('user_interests', ['user_id' => $user->id, 'interest' => 'Phones']);

        $this->withToken($user->token)
            ->postJson('/api/profile/skills', ['skills' => ['Repair'], 'proficiency' => [4]])
            ->assertOk();
        $this->assertDatabaseHas('user_skills', ['user_id' => $user->id, 'skill' => 'Repair']);

        ProfileStory::create([
            'id' => Str::uuid(),
            'user_id' => $user->id,
            'media_type' => 'image',
            'media_url' => 'https://example.com/story.jpg',
            'expires_at' => now()->addHours(2),
        ]);

        $this->withToken($user->token)
            ->getJson("/api/profile/{$user->id}/stories")
            ->assertOk()
            ->assertJsonCount(1, 'stories');
    }
}
