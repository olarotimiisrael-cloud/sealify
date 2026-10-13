<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminBroadcast;
use App\Models\AdminLoginSession;
use App\Models\AdminSignupAlert;
use App\Models\Dispute;
use App\Models\EmailOutbox;
use App\Models\PromotionPayment;
use App\Models\Report;
use App\Models\User;
use App\Models\VerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function users()
    {
        $this->requireAdmin();

        return response()->json(['users' => User::orderByDesc('created_at')->limit(500)->get()]);
    }

    public function updateUser(Request $request, string $id)
    {
        $this->requireAdmin();
        $user = User::findOrFail($id);
        $user->fill($request->except(['password', 'id', 'email']));
        $user->save();

        return response()->json($user->fresh());
    }

    public function deleteUser(string $id)
    {
        $this->requireAdmin();
        abort_if((int) $id === (int) Auth::id(), 403, 'You cannot delete your own account.');

        User::destroy($id);

        return response()->json(['success' => true]);
    }

    public function bulkUsers(Request $request)
    {
        $this->requireAdmin();
        $data = $request->validate([
            'action' => 'required|in:verify,unverify,suspend,restore,ban,delete',
            'user_ids' => 'required|array',
            'user_ids.*' => 'required',
        ]);

        $ids = collect($data['user_ids'])->reject(fn ($id) => (int) $id === (int) Auth::id())->all();

        User::whereIn('id', $ids)->get()->each(function (User $user) use ($data) {
            if ($data['action'] === 'verify') {
                $user->update(['verified' => true, 'status' => 'active']);
            } elseif ($data['action'] === 'unverify') {
                $user->update(['verified' => false]);
            } elseif ($data['action'] === 'suspend') {
                $user->update(['status' => 'suspended']);
            } elseif ($data['action'] === 'restore') {
                $user->update(['status' => 'active']);
            } elseif ($data['action'] === 'ban') {
                $user->update(['status' => 'banned']);
            } elseif ($data['action'] === 'delete' && (int) $user->id !== (int) Auth::id()) {
                $user->delete();
            }
        });

        return response()->json(['success' => true, 'updated' => count($ids)]);
    }

    public function updateVerification(Request $request, string $id)
    {
        $this->requireAdmin();
        $row = VerificationRequest::findOrFail($id);
        $data = $request->validate(['status' => 'required|string', 'admin_notes' => 'nullable|string']);
        $row->update(array_merge($data, ['reviewed_at' => now()]));

        if ($data['status'] === 'approved') {
            User::where('id', $row->user_id)->update([
                'verified' => true,
                'verification_type' => $row->type ?? 'individual',
            ]);
        }

        return response()->json($row->fresh());
    }

    public function updatePromotion(Request $request, string $id)
    {
        $this->requireAdmin();
        $row = PromotionPayment::findOrFail($id);
        $data = $request->validate(['status' => 'required|string', 'admin_notes' => 'nullable|string']);
        $row->update(array_merge($data, ['reviewed_at' => now()]));

        return response()->json($row->fresh());
    }

    public function updateReport(Request $request, string $id)
    {
        $this->requireAdmin();
        $row = Report::findOrFail($id);
        $data = $request->validate(['status' => 'required|string', 'admin_notes' => 'nullable|string']);
        $row->update(array_merge($data, ['reviewed_at' => now()]));

        return response()->json($row->fresh());
    }

    public function updateDispute(Request $request, string $id)
    {
        $this->requireAdmin();
        $row = Dispute::findOrFail($id);
        $data = $request->validate(['status' => 'required|string', 'admin_notes' => 'nullable|string']);
        $row->update(array_merge($data, ['resolved_at' => now()]));

        return response()->json($row->fresh());
    }

    public function signupAlerts(Request $request)
    {
        $this->requireAdmin();
        $query = AdminSignupAlert::query();

        if ($request->filled('status')) {
            $query->where('follow_up_status', $request->input('status'));
        }

        return response()->json(['alerts' => $query->latest()->limit(200)->get()]);
    }

    public function updateSignupAlert(Request $request, string $id)
    {
        $this->requireAdmin();
        $row = AdminSignupAlert::findOrFail($id);
        $data = $request->validate([
            'follow_up_status' => 'nullable|string',
            'follow_up_note' => 'nullable|string',
        ]);
        $row->update(array_merge($data, ['follow_up_at' => now()]));

        return response()->json($row->fresh());
    }

    public function deleteSignupAlert(string $id)
    {
        $this->requireAdmin();
        AdminSignupAlert::destroy($id);

        return response()->json(['success' => true]);
    }

    public function loginSessions()
    {
        $this->requireAdmin();

        return response()->json(['sessions' => AdminLoginSession::latest('login_at')->limit(200)->get()]);
    }

    public function deleteLoginSession(string $id)
    {
        $this->requireAdmin();
        AdminLoginSession::destroy($id);

        return response()->json(['success' => true]);
    }

    public function systemConfig()
    {
        $this->requireAdmin();

        return response()->json([
            'config' => [
                'email_verification_required' => false,
                'phone_verification_required' => false,
                'escrow_enabled' => true,
                'manual_promotion_approval' => true,
                'intrusion_detection_enabled' => true,
            ],
        ]);
    }

    public function updateSystemConfig(Request $request)
    {
        $this->requireAdmin();

        return response()->json(['success' => true, 'config' => $request->all()]);
    }

    public function broadcast(Request $request)
    {
        $this->requireAdmin();
        $data = $request->validate([
            'target' => 'required|string',
            'title' => 'required|string',
            'message' => 'required|string',
        ]);

        $target = $data['target'];
        $query = User::query();
        if ($target === 'buyer') {
            $query->where('role', 'buyer');
        } elseif ($target === 'seller') {
            $query->where('role', 'seller');
        }
        $userIds = $query->limit(500)->pluck('id');

        DB::transaction(function () use ($data, $target, $userIds) {
            AdminBroadcast::create([
                'sender_id' => Auth::id(),
                'target' => $target,
                'title' => $data['title'],
                'content' => $data['message'],
                'user_ids' => $userIds,
                'sent_count' => $userIds->count(),
                'sent_at' => now(),
            ]);

            foreach ($userIds as $userId) {
                DB::table('notifications')->insert([
                    'user_id' => $userId,
                    'type' => 'broadcast',
                    'title' => $data['title'],
                    'description' => $data['message'],
                    'read' => false,
                ]);
            }
        });

        return response()->json(['success' => true, 'sent' => $userIds->count()]);
    }

    public function emailDigest(Request $request)
    {
        $this->requireAdmin();
        $request->validate(['audience' => 'nullable|string']);

        EmailOutbox::create([
            'template' => 'weekly_digest',
            'recipient' => 'digest',
            'payload' => $request->all(),
            'status' => 'queued',
        ]);

        return response()->json(['message' => 'Weekly digest queued', 'success' => true]);
    }

    public function sendAdminEmail(Request $request)
    {
        $this->requireAdmin();
        EmailOutbox::create([
            'template' => 'admin_email',
            'recipient' => is_array($request->input('to')) ? implode(',', (array) $request->input('to')) : (string) $request->input('to'),
            'payload' => $request->all(),
            'status' => 'queued',
        ]);

        return response()->json(['success' => true, 'queued' => true]);
    }

    public function passwordResetEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        EmailOutbox::create([
            'template' => 'password_reset',
            'recipient' => $request->input('email'),
            'payload' => $request->all(),
            'status' => 'queued',
        ]);

        return response()->json(['success' => true, 'queued' => true]);
    }

    public function smsBroadcast(Request $request)
    {
        $this->requireAdmin();
        $request->validate(['target' => 'required|string', 'message' => 'required|string']);

        return $this->queueOutbox($request, 'sms_broadcast');
    }

    public function whatsappBroadcast(Request $request)
    {
        $this->requireAdmin();
        $request->validate(['target' => 'required|string', 'message' => 'required|string']);

        return $this->queueOutbox($request, 'whatsapp_broadcast');
    }

    public function uploadAttachment(Request $request)
    {
        $this->requireAdmin();
        $request->validate([
            'filename' => 'required|string',
            'content' => 'required|string',
            'type' => 'nullable|string',
        ]);

        $content = (string) $request->input('content');
        $size = (int) floor(strlen($content) * 3 / 4);

        return response()->json([
            'success' => true,
            'attachment' => [
                'filename' => $request->input('filename'),
                'content' => $content,
                'type' => $request->input('type') ?: 'application/octet-stream',
                'size' => $size,
            ],
        ]);
    }

    private function queueOutbox(Request $request, string $template)
    {
        EmailOutbox::create([
            'template' => $template,
            'recipient' => (string) $request->input('target', 'all'),
            'payload' => $request->all(),
            'status' => 'queued',
        ]);

        return response()->json(['success' => true, 'queued' => true, 'sent' => 0]);
    }

    private function requireAdmin(): void
    {
        abort_unless(Auth::check(), 401, 'Authentication required');
        abort_unless(Auth::user()?->role === 'admin', 403, 'Administrator access required.');
    }
}
