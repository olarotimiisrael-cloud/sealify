<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function show(string $id)
    {
        $user = User::withCount('listings')->findOrFail($id);

        return response()->json($user);
    }

    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        abort_unless((int) $user->id === (int) $request->user()->id, 403, 'You can only update your own profile.');

        $data = $request->validate([
            'full_name' => 'sometimes|string|max:255',
            'phone_number' => 'sometimes|nullable|string|max:30',
            'bio' => 'sometimes|nullable|string|max:1000',
            'location' => 'sometimes|string|max:255',
            'avatar_url' => 'sometimes|nullable|string|max:500',
        ]);

        if (isset($data['full_name'])) {
            $data['name'] = $data['full_name'];
        }

        $user->update($data);

        return response()->json($user->fresh());
    }
}
