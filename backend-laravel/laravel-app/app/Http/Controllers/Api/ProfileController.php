<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProfileStory;
use App\Models\ProfileReaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    public function getStories(Request $request, $userId)
    {
        $user = User::findOrFail($userId);

        if (! $this->canViewStories($request->user()?->id ?? null, $user)) {
            return response()->json([
                'error' => 'Access denied',
                'message' => 'This user\'s stories are private',
            ], 403);
        }

        $stories = ProfileStory::where('user_id', $userId)
            ->where('expires_at', '>', now())
            ->withCount('reactions')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['stories' => $stories], 200);
    }

    public function createStory(Request $request)
    {
        $user = $request->user();
        $request->validate([
            'media' => 'required|file|max:10240',
            'media_type' => 'required|in:image,video,text',
            'caption' => 'nullable|string|max:500',
        ]);

        $mediaPath = $request->file('media')->store('profile_stories', 'public');
        $mediaUrl = Storage::url($mediaPath);

        $story = ProfileStory::create([
            'id' => Str::uuid(),
            'user_id' => $user->id,
            'media_type' => $request->input('media_type'),
            'media_url' => $mediaUrl,
            'caption' => $request->input('caption'),
            'expires_at' => now()->addHours(24),
        ]);

        return response()->json(['story' => $story->loadCount('reactions')], 201);
    }

    public function reactToStory(Request $request, $storyId)
    {
        $user = $request->user();
        $request->validate([
            'reaction_type' => 'required|in:like,love,wow,sad,angry',
        ]);

        $story = ProfileStory::where('id', $storyId)
            ->where('expires_at', '>', now())
            ->firstOrFail();

        if (! $this->canInteractWithStory($user->id, $story)) {
            return response()->json([
                'error' => 'Access denied',
                'message' => 'You cannot react to this story',
            ], 403);
        }

        $existingReaction = ProfileReaction::where('story_id', $storyId)
            ->where('user_id', $user->id)
            ->where('reaction_type', $request->input('reaction_type'))
            ->first();

        if ($existingReaction) {
            $existingReaction->delete();
            $action = 'removed';
        } else {
            ProfileReaction::create([
                'id' => Str::uuid(),
                'story_id' => $storyId,
                'user_id' => $user->id,
                'reaction_type' => $request->input('reaction_type'),
            ]);
            $action = 'added';
        }

        $reactionCount = $story->reactions()
            ->where('reaction_type', $request->input('reaction_type'))
            ->count();

        return response()->json(['action' => $action, 'reaction_count' => $reactionCount], 200);
    }

    public function getProfile(Request $request, $userId)
    {
        $user = User::with([
            'interests',
            'skills',
            'stories' => function ($query) {
                $query->where('expires_at', '>', now());
            },
            'listings' => function ($query) {
                $query->where('status', 'active');
            },
            'reviewsReceived',
        ])->findOrFail($userId);

        if (! $this->canViewProfile($request->user()?->id ?? null, $user)) {
            return response()->json([
                'error' => 'Access denied',
                'message' => 'This profile is private',
            ], 403);
        }

        return response()->json(['profile' => $user], 200);
    }

    public function updateInterests(Request $request)
    {
        $user = $request->user();
        $request->validate([
            'interests' => 'required|array',
            'interests.*' => 'string|max:100',
        ]);

        $user->interests()->delete();

        foreach ($request->input('interests') as $interest) {
            $user->interests()->create([
                'id' => Str::uuid(),
                'interest' => trim($interest),
                'weight' => 1,
            ]);
        }

        return response()->json(['message' => 'Interests updated successfully'], 200);
    }

    public function updateSkills(Request $request)
    {
        $user = $request->user();
        $request->validate([
            'skills' => 'required|array',
            'skills.*' => 'string|max:100',
            'proficiency' => 'required|array',
            'proficiency.*' => 'integer|between:1,5',
        ]);

        $skills = $request->input('skills');
        $proficiency = $request->input('proficiency');

        $user->skills()->delete();

        foreach ($skills as $index => $skill) {
            $user->skills()->create([
                'id' => Str::uuid(),
                'skill' => trim($skill),
                'proficiency_level' => $proficiency[$index] ?? 1,
            ]);
        }

        return response()->json(['message' => 'Skills updated successfully'], 200);
    }

    private function canViewStories($viewerId, User $user)
    {
        if ($viewerId === $user->id) {
            return true;
        }

        return true;
    }

    private function canViewProfile($viewerId, User $user)
    {
        if ($viewerId === $user->id) {
            return true;
        }

        return true;
    }

    private function canInteractWithStory($userId, ProfileStory $story)
    {
        if ($story->user_id === $userId) {
            return true;
        }

        if ($story->expires_at && $story->expires_at->isPast()) {
            return false;
        }

        return $this->canViewProfile($userId, $story->user);
    }
}
