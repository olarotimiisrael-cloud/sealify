<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiGeneration;
use Illuminate\Http\Request;

class AiGenerationController extends Controller
{
    public function generate(Request $request)
    {
        $data = $request->validate([
            'type' => 'required|in:text,image,video,audio',
            'prompt' => 'required|string|max:5000',
            'model' => 'sometimes|string|max:100',
            'parameters' => 'sometimes|array',
        ]);

        $generation = AiGeneration::create([
            'user_id' => $request->user()->id,
            'type' => $data['type'],
            'prompt' => $data['prompt'],
            'model' => $data['model'] ?? 'default',
            'parameters' => $data['parameters'] ?? [],
            'status' => 'pending',
        ]);

        // Queue the generation job
        // AiGenerationJob::dispatch($generation);

        return response()->json([
            'success' => true,
            'generation_id' => $generation->id,
            'status' => 'pending',
            'message' => 'Generation queued. Check status endpoint for results.',
        ], 202);
    }

    public function status(Request $request, string $id)
    {
        $generation = AiGeneration::where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json($generation);
    }

    public function history(Request $request)
    {
        $generations = AiGeneration::where('user_id', $request->user()->id)
            ->latest()
            ->paginate(20);

        return response()->json($generations);
    }

    public function delete(Request $request, string $id)
    {
        $generation = AiGeneration::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $generation->delete();

        return response()->json(['success' => true]);
    }
}