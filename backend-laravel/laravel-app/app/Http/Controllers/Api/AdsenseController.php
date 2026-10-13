<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Adsense;
use Illuminate\Http\Request;

class AdsenseController extends Controller
{
    public function config(Request $request)
    {
        $config = Adsense::where('active', true)
            ->orderBy('position')
            ->get()
            ->map(function ($ad) {
                return [
                    'id' => $ad->id,
                    'position' => $ad->position,
                    'ad_slot' => $ad->ad_slot,
                    'ad_client' => $ad->ad_client,
                    'format' => $ad->format,
                    'responsive' => $ad->responsive,
                ];
            });

        return response()->json(['ads' => $config]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'position' => 'required|string|max:50',
            'ad_client' => 'required|string|max:50',
            'ad_slot' => 'required|string|max:50',
            'format' => 'sometimes|string|max:20',
            'responsive' => 'sometimes|boolean',
            'active' => 'sometimes|boolean',
        ]);

        $ad = Adsense::create($data);

        return response()->json($ad, 201);
    }

    public function update(Request $request, string $id)
    {
        $ad = Adsense::findOrFail($id);

        $data = $request->validate([
            'position' => 'sometimes|string|max:50',
            'ad_client' => 'sometimes|string|max:50',
            'ad_slot' => 'sometimes|string|max:50',
            'format' => 'sometimes|string|max:20',
            'responsive' => 'sometimes|boolean',
            'active' => 'sometimes|boolean',
        ]);

        $ad->update($data);

        return response()->json($ad->fresh());
    }

    public function destroy(Request $request, string $id)
    {
        $ad = Adsense::findOrFail($id);
        $ad->delete();

        return response()->json(['success' => true]);
    }
}