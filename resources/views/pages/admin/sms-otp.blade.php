@extends('layouts.admin')

@section('adminContent')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-black text-slate-900 mb-2">SMS OTP Management</h1>
            <p class="text-slate-600">Manage SMS verification codes. No third-party SMS gateway required - all OTPs stored locally.</p>
        </div>
        <a href="{{ route('admin.dashboard') }}" class="text-sm text-emerald-600 font-bold hover:underline">← Back to Dashboard</a>
    </div>

    <!-- Info Box -->
    <div class="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
        <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
                <h3 class="text-lg font-bold text-slate-900 mb-1">No Third-Party SMS Gateway</h3>
                <p class="text-sm text-slate-600 mb-2">
                    All SMS OTP codes are generated and stored locally in the database. No Twilio, no AWS SNS, no third-party SMS provider required.
                </p>
                <ul class="text-sm text-slate-600 space-y-1">
                    <li>• Users request OTP via their profile/settings</li>
                    <li>• OTP codes are stored locally with 15-minute expiry</li>
                    <li>• Admin can view, verify, or delete any OTP code from this panel</li>
                    <li>• Users enter the OTP code they received to verify their phone</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- SMS OTP Table -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table class="w-full text-left">
            <thead>
                <tr class="border-b border-slate-100">
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">OTP Code</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">User</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Phone Number</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Purpose</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Status</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Expires At</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @forelse ($otps as $otp)
                    <tr class="group hover:bg-slate-50
                        @if($otp->is_used) bg-emerald-50 @elseif($otp->isExpired()) bg-rose-50 @endif">
                        <td class="px-6 py-4 font-mono font-bold text-slate-900">
                            {{ $otp->otp_code }}
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                                    {{ strtoupper(substr($otp->user->name ?? 'U', 0, 1)) }}
                                </div>
                                <div>
                                    <p class="font-medium text-slate-900">{{ $otp->user->name ?? 'Unknown' }}</p>
                                    <p class="text-xs text-slate-500">{{ $otp->user->email }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 font-mono text-sm text-slate-900">{{ $otp->phone_number }}</td>
                        <td class="px-6 py-4 text-sm text-slate-600">{{ ucfirst($otp->purpose) }}</td>
                        <td class="px-6 py-4">
                            @if($otp->is_used)
                                <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-700">
                                    ✓ Used
                                </span>
                            @elseif($otp->isExpired())
                                <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-rose-100 text-rose-700">
                                    ⚠ Expired
                                </span>
                            @else
                                <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-amber-100 text-amber-700">
                                    ⏳ Pending
                                </span>
                            @endif
                        </td>
                        <td class="px-6 py-4 text-sm text-slate-600">
                            {{ $otp->expires_at->format('M d, Y h:i A') }}
                        </td>
                        <td class="px-6 py-4 text-right">
                            <div class="flex items-center justify-end gap-2">
                                @if(!$otp->is_used && !$otp->isExpired())
                                    <form method="POST" action="{{ route('admin.sms-otp.verify', $otp) }}" class="inline">
                                        @csrf
                                        <button type="submit"
                                                class="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors" title="Manually Verify OTP">
                                            ✓ Verify
                                        </button>
                                    </form>
                                @endif
                                <form method="POST" action="{{ route('admin.sms-otp.delete', $otp) }}" onsubmit="return confirm('Delete this OTP record?')" class="inline">
                                    @csrf @method('DELETE')
                                    <button type="submit" class="p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors" title="Delete OTP Record">
                                        🗑️
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="px-6 py-12 text-center text-slate-500">
                            <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-4xl">📱</div>
                            <p class="text-lg font-bold text-slate-900 mb-2">No SMS OTP records</p>
                            <p class="text-slate-500">No OTP codes have been generated yet.</p>
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
        {{ $otps->links() }}
    </div>
</div>
@endsection
