<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ListingResource;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\Dispute;
use App\Models\IntrusionLog;
use App\Models\KycVerification;
use App\Models\Listing;
use App\Models\Notification;
use App\Models\Promotion;
use App\Models\Report;
use App\Models\SystemConfig;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function stats(): JsonResponse
    {
        return response()->json([
            'users' => User::count(),
            'active_listings' => Listing::query()->active()->count(),
            'pending_kyc' => KycVerification::where('status', 'pending')->count(),
            'open_reports' => Report::where('status', 'pending')->count(),
            'open_disputes' => Dispute::where('status', 'pending')->count(),
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $query = User::query()->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('role')) {
            $query->where('role', $request->string('role'));
        }

        $users = $query->paginate(min(max($request->integer('limit', 50), 1), 100));

        return response()->json([
            'users' => UserResource::collection($users)->resolve(),
            'total' => $users->total(),
        ]);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        abort_if($user->is($request->user()) && $request->input('status') !== 'active', 422, 'You cannot restrict your own account.');

        $data = $request->validate([
            'status' => ['sometimes', 'in:active,suspended,banned'],
            'role' => ['sometimes', 'in:buyer,seller,admin'],
            'restriction_reason' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'is_verified_seller' => ['sometimes', 'boolean'],
        ]);

        $user->fill($data)->save();

        return response()->json(['user' => (new UserResource($user->fresh()))->resolve()]);
    }

    public function destroyUser(Request $request, User $user): JsonResponse
    {
        abort_if($user->is($request->user()), 422, 'You cannot delete your own account.');

        $user->delete();

        return response()->json(['success' => true]);
    }

    public function listings(Request $request): JsonResponse
    {
        $listings = Listing::with(['user', 'category', 'images', 'activePromotion'])
            ->latest()
            ->paginate(min(max($request->integer('limit', 50), 1), 100));

        return response()->json([
            'listings' => ListingResource::collection($listings)->resolve(),
            'total' => $listings->total(),
        ]);
    }

    public function reports(Request $request): JsonResponse
    {
        return $this->cases($request, Report::query(), 'reports');
    }

    public function disputes(Request $request): JsonResponse
    {
        return $this->cases($request, Dispute::query(), 'disputes');
    }

    public function verifications(Request $request): JsonResponse
    {
        return $this->cases($request, KycVerification::query(), 'verifications');
    }

    public function promotions(Request $request): JsonResponse
    {
        return $this->cases($request, Promotion::query(), 'promotions');
    }

    public function auditLogs(Request $request): JsonResponse
    {
        return $this->cases($request, AuditLog::query(), 'auditLogs');
    }

    public function intrusionLogs(Request $request): JsonResponse
    {
        return $this->cases($request, IntrusionLog::query(), 'intrusionLogs');
    }

    public function updateReport(Request $request, Report $report): JsonResponse
    {
        $data = $request->validate(['status' => ['required', 'in:pending,reviewing,resolved,dismissed']]);
        $report->update($data);

        return response()->json(['report' => $report->fresh()]);
    }

    public function updateDispute(Request $request, Dispute $dispute): JsonResponse
    {
        $data = $request->validate(['status' => ['required', 'in:pending,reviewing,resolved,rejected']]);
        $dispute->update($data);

        return response()->json(['dispute' => $dispute->fresh()]);
    }

    public function updateVerification(Request $request, KycVerification $verification): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,verified,rejected,failed'],
            'rejection_reason' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($data, $verification): void {
            $verification->fill([
                ...$data,
                'verified_at' => $data['status'] === 'verified' ? now() : null,
                'rejected_at' => $data['status'] === 'rejected' ? now() : null,
            ])->save();

            if ($data['status'] === 'verified') {
                $verification->user()->update([
                    'is_verified_seller' => true,
                    'kyc_verified_at' => now(),
                    'kyc_type' => $verification->type,
                ]);
            }
        });

        return response()->json(['verification' => $verification->fresh()]);
    }

    public function updatePromotion(Request $request, Promotion $promotion): JsonResponse
    {
        $data = $request->validate(['status' => ['required', 'in:active,expired,cancelled']]);
        $promotion->update($data);

        return response()->json(['promotion' => $promotion->fresh()]);
    }

    public function systemConfig(): JsonResponse
    {
        return response()->json(['config' => SystemConfig::query()->orderBy('key')->get()]);
    }

    public function updateSystemConfig(Request $request): JsonResponse
    {
        $data = $request->validate([
            'key' => ['required', 'string', 'max:255'],
            'value' => ['required', 'array'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
        ]);

        $config = SystemConfig::updateOrCreate(['key' => $data['key']], $data);

        return response()->json(['config' => $config]);
    }

    public function broadcast(Request $request): JsonResponse
    {
        $data = $request->validate([
            'target' => ['required', 'in:all,buyer,seller'],
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $query = User::query()->where('status', 'active');
        if ($data['target'] !== 'all') {
            $query->where('role', $data['target']);
        }

        $sent = 0;
        $query->select('id')->chunkById(500, function ($users) use ($data, &$sent): void {
            $rows = $users->map(fn (User $user): array => [
                'user_id' => $user->id,
                'type' => 'broadcast',
                'title' => $data['title'],
                'description' => $data['message'],
                'created_at' => now(),
                'updated_at' => now(),
            ])->all();

            Notification::insert($rows);
            $sent += count($rows);
        });

        return response()->json(['success' => true, 'sent' => $sent]);
    }

    public function signupAlerts(Request $request): JsonResponse
    {
        $query = User::query()->where('created_at', '>=', now()->subDays(30));

        if ($request->filled('status')) {
            // Signup alerts don't have a status column; return recent users
        }

        $alerts = $query->latest()->limit(200)->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
                'status' => $user->status,
                'created_at' => $user->created_at,
            ];
        });

        return response()->json(['alerts' => $alerts]);
    }

    public function updateSignupAlert(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'max:50'],
            'note' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ]);

        return response()->json([
            'alert' => array_merge(['id' => $id], $data),
        ]);
    }

    public function loginSessions(Request $request): JsonResponse
    {
        return response()->json([
            'sessions' => [],
            'active' => 0,
        ]);
    }

    public function updateLoginSession(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'max:50'],
        ]);

        return response()->json([
            'session' => array_merge(['id' => $id], $data),
        ]);
    }

    private function cases(Request $request, $query, string $key): JsonResponse
    {
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $items = $query->latest()->paginate(min(max($request->integer('limit', 50), 1), 100));

        return response()->json([$key => $items->items(), 'total' => $items->total()]);
    }
}
