<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdCardAsset;
use App\Models\AdminBroadcast;
use App\Models\AdminLoginSession;
use App\Models\AdminMessage;
use App\Models\AdminSignupAlert;
use App\Models\AdImage;
use App\Models\Announcement;
use App\Models\AnalyticsEvent;
use App\Models\AuditLog;
use App\Models\BuyerRequest;
use App\Models\BuyerRequestResponse;
use App\Models\Category;
use App\Models\Conversation;
use App\Models\CredentialVerification;
use App\Models\Dispute;
use App\Models\EmailOtp;
use App\Models\EmailOutbox;
use App\Models\EscrowOrder;
use App\Models\Favorite;
use App\Models\IntrusionLog;
use App\Models\Listing;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\Notification;
use App\Models\PasswordRequest;
use App\Models\PerformanceMetric;
use App\Models\PhoneOtp;
use App\Models\PromotionPayment;
use App\Models\PromotionPlan;
use App\Models\PushSubscription;
use App\Models\QrCode;
use App\Models\RecentDeal;
use App\Models\Referral;
use App\Models\ReferralClick;
use App\Models\ReferralReward;
use App\Models\Report;
use App\Models\Review;
use App\Models\SafeSpot;
use App\Models\SavedSearch;
use App\Models\SearchAlert;
use App\Models\ShareableLink;
use App\Models\SiteSetting;
use App\Models\SocialShareEvent;
use App\Models\StatusTemplate;
use App\Models\Subcategory;
use App\Models\SystemConfig;
use App\Models\Transaction;
use App\Models\User;
use App\Models\UserSetting;
use App\Models\VerificationBadge;
use App\Models\VerificationRequest;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class DataController extends Controller
{
    private const RESOURCES = [
        'profiles' => User::class,
        'categories' => Category::class,
        'subcategories' => Subcategory::class,
        'ads' => Listing::class,
        'ad_images' => AdImage::class,
        'announcements' => Announcement::class,
        'reviews' => Review::class,
        'buyer_requests' => BuyerRequest::class,
        'buyer_request_responses' => BuyerRequestResponse::class,
        'favorites' => Favorite::class,
        'search_alerts' => SearchAlert::class,
        'saved_searches' => SavedSearch::class,
        'user_settings' => UserSetting::class,
        'push_subscriptions' => PushSubscription::class,
        'verification_requests' => VerificationRequest::class,
        'password_requests' => PasswordRequest::class,
        'conversations' => Conversation::class,
        'messages' => Message::class,
        'notifications' => Notification::class,
        'reports' => Report::class,
        'audit_logs' => AuditLog::class,
        'intrusion_logs' => IntrusionLog::class,
        'system_configs' => SystemConfig::class,
        'site_settings' => SiteSetting::class,
        'promotion_plans' => PromotionPlan::class,
        'safe_spots' => SafeSpot::class,
        'recent_deals' => RecentDeal::class,
        'wallets' => Wallet::class,
        'transactions' => Transaction::class,
        'promotion_payments' => PromotionPayment::class,
        'disputes' => Dispute::class,
        'escrow_orders' => EscrowOrder::class,
        'analytics_events' => AnalyticsEvent::class,
        'performance_metrics' => PerformanceMetric::class,
        'email_otps' => EmailOtp::class,
        'phone_otps' => PhoneOtp::class,
        'admin_messages' => AdminMessage::class,
        'admin_broadcasts' => AdminBroadcast::class,
        'admin_signup_alerts' => AdminSignupAlert::class,
        'admin_login_sessions' => AdminLoginSession::class,
        'referrals' => Referral::class,
        'referral_rewards' => ReferralReward::class,
        'referral_clicks' => ReferralClick::class,
        'email_outbox' => EmailOutbox::class,
        'shareable_links' => ShareableLink::class,
        'ad_card_assets' => AdCardAsset::class,
        'qr_codes' => QrCode::class,
        'status_templates' => StatusTemplate::class,
        'social_share_events' => SocialShareEvent::class,
        'verification_badges' => VerificationBadge::class,
        'credential_verifications' => CredentialVerification::class,
        'message_attachments' => MessageAttachment::class,
    ];

    public function index(Request $request, string $resource)
    {
        $model = $this->model($resource);
        $query = $model->newQuery();

        foreach ($request->except(['page', 'per_page', 'sort_by', 'sort_dir', 'limit']) as $key => $value) {
            $query->where($key, urldecode((string) $value));
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        if (in_array($sortBy, ['created_at', 'updated_at', 'last_message_time', 'shared_at', 'sort_order'], true)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        return response()->json($query->get());
    }

    public function show(string $resource, string $id)
    {
        $model = $this->model($resource);

        return response()->json($model->newQuery()->findOrFail($id));
    }

    public function store(Request $request, string $resource)
    {
        $this->requireUser($request);
        $model = $this->model($resource)->newInstance();
        $model->fill($request->all());
        $model->save();

        return response()->json($model->fresh(), 201);
    }

    public function update(Request $request, string $resource, string $id)
    {
        $this->requireUser($request);
        $model = $this->model($resource)->newQuery()->findOrFail($id);
        $model->fill($request->all());
        $model->save();

        return response()->json($model->fresh());
    }

    public function destroy(Request $request, string $resource, string $id)
    {
        $this->requireUser($request);
        $model = $this->model($resource)->newQuery()->findOrFail($id);
        $model->delete();

        return response()->json(['success' => true]);
    }

    private function model(string $resource): Model
    {
        if (! array_key_exists($resource, self::RESOURCES)) {
            abort(404, 'Unsupported resource');
        }

        $class = self::RESOURCES[$resource];

        return new $class;
    }

    private function requireUser(Request $request): void
    {
        abort_unless($request->user(), 401, 'Authentication required');
    }
}
