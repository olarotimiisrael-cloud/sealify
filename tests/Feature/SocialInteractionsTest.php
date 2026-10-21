<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Comment;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Follow;
use App\Models\Listing;
use App\Models\Message;
use App\Models\Notification;
use App\Models\Reaction;
use App\Models\User;
use App\Mail\NewListingMail;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SocialInteractionsTest extends TestCase
{
    use \Illuminate\Foundation\Testing\RefreshDatabase;

    protected function authenticate(User $user): void
    {
        Sanctum::actingAs($user);
    }

    protected function makeListing(User $owner): Listing
    {
        $category = Category::first() ?? Category::create([
            'name' => 'Furniture',
            'slug' => 'furniture',
            'is_active' => true,
        ]);

        return Listing::factory()->create([
            'user_id' => $owner->id,
            'category_id' => $category->id,
        ]);
    }

    public function test_user_can_follow_and_unfollow_another_user(): void
    {
        $follower = User::factory()->create();
        $followee = User::factory()->create();

        $this->authenticate($follower);

        $this->postJson('/api/users/'.$followee->id.'/follow')
            ->assertStatus(201)
            ->assertJson(['is_following' => true]);

        $this->assertTrue($follower->fresh()->isFollowing($followee));
        $this->assertDatabaseHas('follows', [
            'follower_id' => $follower->id,
            'following_id' => $followee->id,
        ]);

        $this->deleteJson('/api/users/'.$followee->id.'/follow')
            ->assertStatus(200)
            ->assertJson(['is_following' => false]);

        $this->assertFalse($follower->fresh()->isFollowing($followee));
        $this->assertDatabaseMissing('follows', [
            'follower_id' => $follower->id,
            'following_id' => $followee->id,
        ]);
    }

    public function test_user_cannot_follow_themselves(): void
    {
        $user = User::factory()->create();

        $this->authenticate($user);

        $this->postJson('/api/users/'.$user->id.'/follow')
            ->assertStatus(403);
    }

    public function test_follow_check_returns_following_status(): void
    {
        $follower = User::factory()->create();
        $followee = User::factory()->create();

        $this->authenticate($follower);

        $this->getJson('/api/users/'.$followee->id.'/follow/check')
            ->assertJson(['is_following' => false]);

        $this->postJson('/api/users/'.$followee->id.'/follow');

        $this->getJson('/api/users/'.$followee->id.'/follow/check')
            ->assertJson(['is_following' => true]);
    }

    public function test_followers_and_following_lists(): void
    {
        $user = User::factory()->create();
        $follower = User::factory()->create();
        $following = User::factory()->create();

        Follow::create(['follower_id' => $follower->id, 'following_id' => $user->id]);
        Follow::create(['follower_id' => $user->id, 'following_id' => $following->id]);

        $this->getJson('/api/users/'.$user->id.'/followers')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/users/'.$user->id.'/following')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_reaction_toggle_on_listing(): void
    {
        $owner = User::factory()->create();
        $listing = $this->makeListing($owner);

        $this->authenticate(User::factory()->create());

        $payload = [
            'reactionable_type' => Listing::class,
            'reactionable_id' => $listing->id,
            'reaction_type' => 'like',
        ];

        // Add a like
        $this->postJson('/api/reactions', $payload)
            ->assertStatus(201)
            ->assertJson(['reaction' => ['reaction_type' => 'like']]);

        $this->assertDatabaseHas('reactions', [
            'reactionable_type' => Listing::class,
            'reactionable_id' => $listing->id,
            'reaction_type' => 'like',
        ]);

        // Change to love
        $payload['reaction_type'] = 'love';
        $this->postJson('/api/reactions', $payload)
            ->assertStatus(200)
            ->assertJson(['reaction' => ['reaction_type' => 'love']]);

        $this->assertDatabaseCount('reactions', 1);

        // Remove by liking again
        $payload['reaction_type'] = 'love';
        $this->postJson('/api/reactions', $payload)
            ->assertStatus(200)
            ->assertJson(['reaction' => null]);

        $this->assertDatabaseCount('reactions', 0);
    }

    public function test_reaction_index_returns_counts_and_user_reaction(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $listing = $this->makeListing($user);

        Reaction::create([
            'user_id' => $user->id,
            'reactionable_type' => Listing::class,
            'reactionable_id' => $listing->id,
            'reaction_type' => 'like',
        ]);
        Reaction::create([
            'user_id' => $other->id,
            'reactionable_type' => Listing::class,
            'reactionable_id' => $listing->id,
            'reaction_type' => 'love',
        ]);

        $this->authenticate($user);

        $query = http_build_query([
            'reactionable_type' => Listing::class,
            'reactionable_id' => $listing->id,
        ]);

        $this->getJson('/api/reactions?'.$query)
            ->assertStatus(200)
            ->assertJson([
                'counts' => ['like' => 1, 'love' => 1],
                'user_reaction' => 'like',
            ]);
    }

    public function test_comment_create_list_and_delete(): void
    {
        $owner = User::factory()->create();
        $listing = $this->makeListing($owner);
        $commenter = User::factory()->create();

        $this->authenticate($commenter);

        $this->postJson('/api/comments', [
            'commentable_type' => Listing::class,
            'commentable_id' => $listing->id,
            'content' => 'Great item!',
        ])->assertStatus(201)
         ->assertJson(['data' => ['content' => 'Great item!']]);

        $this->assertDatabaseHas('comments', [
            'user_id' => $commenter->id,
            'commentable_type' => Listing::class,
            'commentable_id' => $listing->id,
            'content' => 'Great item!',
        ]);

        $comment = Comment::first();

        // Reply
        $this->postJson('/api/comments', [
            'commentable_type' => Listing::class,
            'commentable_id' => $listing->id,
            'content' => 'Thanks!',
            'parent_id' => $comment->id,
        ])->assertStatus(201);

        $this->assertDatabaseHas('comments', [
            'parent_id' => $comment->id,
            'content' => 'Thanks!',
        ]);

        // List comments
        $query = http_build_query([
            'commentable_type' => Listing::class,
            'commentable_id' => $listing->id,
        ]);

        $this->getJson('/api/comments?'.$query)
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');

        // Delete own comment
        $this->deleteJson('/api/comments/'.$comment->id)
            ->assertStatus(200);

        $this->assertDatabaseMissing('comments', ['id' => $comment->id]);
        $this->assertDatabaseMissing('comments', ['parent_id' => $comment->id]);
    }

    public function test_user_cannot_delete_others_comment(): void
    {
        $commenter = User::factory()->create();
        $listing = $this->makeListing($commenter);
        $comment = Comment::create([
            'user_id' => $commenter->id,
            'commentable_type' => Listing::class,
            'commentable_id' => $listing->id,
            'content' => 'Someone else comment',
        ]);

        $this->authenticate(User::factory()->create());

        $this->deleteJson('/api/comments/'.$comment->id)
            ->assertStatus(403);
    }

    public function test_voice_note_sent_in_conversation(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();

        $conversation = Conversation::create([
            'created_by' => $sender->id,
            'last_message_at' => now(),
        ]);
        ConversationParticipant::insert([
            ['conversation_id' => $conversation->id, 'user_id' => $sender->id, 'created_at' => now(), 'updated_at' => now()],
            ['conversation_id' => $conversation->id, 'user_id' => $recipient->id, 'created_at' => now(), 'updated_at' => now()],
        ]);

        $this->authenticate($sender);

        $uploaded = \Illuminate\Http\UploadedFile::fake()->create('voice.ogg', 1000);

        $this->postJson('/api/conversations/'.$conversation->id.'/voice-notes', [
            'voice' => $uploaded,
            'duration_seconds' => 15,
        ])->assertStatus(201)
         ->assertJson(['data' => ['type' => 'voice']]);

        $this->assertDatabaseHas('messages', [
            'conversation_id' => $conversation->id,
            'sender_id' => $sender->id,
            'type' => 'voice',
        ]);

        $this->assertDatabaseHas('voice_notes', [
            'conversation_id' => $conversation->id,
            'sender_id' => $sender->id,
            'duration_seconds' => 15,
        ]);

        $this->assertDatabaseHas('message_attachments', [
            'message_id' => Message::where('type', 'voice')->first()->id,
            'mime_type' => 'audio/ogg',
        ]);
    }

    public function test_new_listing_notifies_followers_in_app_and_by_email(): void
    {
        Mail::fake();

        $category = Category::create([
            'name' => 'Furniture',
            'slug' => 'furniture',
            'is_active' => true,
        ]);
        $owner = User::factory()->create();
        $follower1 = User::factory()->create(['email_notifications' => true]);
        $follower2 = User::factory()->create(['email_notifications' => false]);
        $nonFollower = User::factory()->create(['email_notifications' => true]);

        Follow::create(['follower_id' => $follower1->id, 'following_id' => $owner->id]);
        Follow::create(['follower_id' => $follower2->id, 'following_id' => $owner->id]);

        $this->authenticate($owner);

        $payload = [
            'category_id' => $category->id,
            'title' => 'Vintage Chair',
            'description' => 'A beautifully preserved vintage wooden chair in excellent condition.',
            'price' => 15000,
            'condition' => 'good',
            'location' => 'Lagos',
            'status' => 'active',
        ];

        $this->postJson('/api/listings', $payload)
            ->assertStatus(201);

        $listing = Listing::where('title', 'Vintage Chair')->first();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $follower1->id,
            'type' => 'new_listing',
            'link_url' => '/listings/'.$listing->slug,
        ]);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $follower2->id,
            'type' => 'new_listing',
        ]);
        $this->assertDatabaseMissing('notifications', [
            'user_id' => $nonFollower->id,
            'type' => 'new_listing',
        ]);

        Mail::assertQueued(NewListingMail::class, 1);
    }
}
