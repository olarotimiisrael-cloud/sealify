<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReactionRequest;
use App\Models\Reaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReactionController extends Controller
{
    /** Allowed emoji-style reaction types. */
    private const TYPES = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'reactionable_type' => ['required', 'string', 'in:' . implode(',', \App\Http\Requests\StoreReactionRequest::ALLOWED_MODELS)],
            'reactionable_id' => ['required', 'string'],
        ]);

        $counts = Reaction::query()
            ->where('reactionable_type', $request->string('reactionable_type'))
            ->where('reactionable_id', $request->string('reactionable_id'))
            ->select('reaction_type', \DB::raw('count(*) as count'))
            ->groupBy('reaction_type')
            ->get()
            ->pluck('count', 'reaction_type');

        $userReaction = null;
        if ($user = $request->user()) {
            $mine = Reaction::where('user_id', $user->id)
                ->where('reactionable_type', $request->string('reactionable_type'))
                ->where('reactionable_id', $request->string('reactionable_id'))
                ->first();

            if ($mine) {
                $userReaction = $mine->reaction_type;
            }
        }

        $counts = collect(self::TYPES)->mapWithKeys(fn ($t) => [$t => (int) ($counts->get($t, 0))])->all();

        return response()->json([
            'counts' => $counts,
            'user_reaction' => $userReaction,
        ]);
    }

    public function store(StoreReactionRequest $request): JsonResponse
    {
        $user = $request->user();
        $type = $request->validated('reaction_type', 'like');
        $modelClass = $request->validated('reactionable_type');
        $modelId = $request->validated('reactionable_id');

        $model = $modelClass::findOrFail($modelId);

        $reaction = Reaction::where('user_id', $user->id)
            ->where('reactionable_type', $modelClass)
            ->where('reactionable_id', $model->getKey())
            ->first();

        if ($reaction) {
            if ($reaction->reaction_type === $type) {
                $reaction->delete();

                return response()->json([
                    'message' => 'Reaction removed.',
                    'reaction' => null,
                ]);
            }

            $reaction->update(['reaction_type' => $type]);

            return response()->json([
                'message' => 'Reaction updated.',
                'reaction' => $this->present($reaction),
            ]);
        }

        Reaction::create([
            'user_id' => $user->id,
            'reactionable_type' => $modelClass,
            'reactionable_id' => $model->getKey(),
            'reaction_type' => $type,
        ]);

        return response()->json([
            'message' => 'Reaction added.',
            'reaction' => $this->present(Reaction::where('user_id', $user->id)
                ->where('reactionable_type', $modelClass)
                ->where('reactionable_id', $model->getKey())
                ->first()),
        ], 201);
    }

    /** @return array<string, mixed> */
    private function present(Reaction $reaction): array
    {
        return [
            'id' => $reaction->id,
            'reaction_type' => $reaction->reaction_type,
            'reactionable_type' => $reaction->reactionable_type,
            'reactionable_id' => $reaction->reactionable_id,
            'user_id' => $reaction->user_id,
            'created_at' => $reaction->created_at,
        ];
    }
}
