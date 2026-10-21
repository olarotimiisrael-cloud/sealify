<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Requests\Auth\UploadAvatarRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->fill($request->validated());
        $user->save();

        return response()->json([
            'data' => new UserResource($user->fresh()),
            'message' => 'Profile updated.',
        ]);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->forceFill(['password' => $request->password])->save();

        $currentTokenId = $request->user()->currentAccessToken()->id;
        $user->tokens()->where('id', '!=', $currentTokenId)->delete();

        return response()->json([
            'message' => 'Password changed. Other sessions have been signed out.',
        ]);
    }

    public function uploadAvatar(UploadAvatarRequest $request): JsonResponse
    {
        $user = $request->user();

        if ($user->avatar_url) {
            $previous = $this->pathFromUrl($user->avatar_url);
            if ($previous && Storage::disk('public')->exists($previous)) {
                Storage::disk('public')->delete($previous);
            }
        }

        $extension = strtolower($request->file('avatar')->extension() ?: 'jpg');

        $path = $request->file('avatar')->storeAs(
            'avatars',
            "user-{$user->id}-".time().".{$extension}",
            'public'
        );

        $url = Storage::disk('public')->url($path);

        $user->forceFill(['avatar_url' => $url])->save();

        return response()->json([
            'data' => [
                'avatar_url' => $url,
            ],
            'message' => 'Avatar updated.',
        ]);
    }

    protected function pathFromUrl(?string $url): ?string
    {
        if (! $url) {
            return null;
        }

        $marker = '/storage/';
        $pos = strpos($url, $marker);

        if ($pos === false) {
            return null;
        }

        return substr($url, $pos + strlen($marker));
    }
}
