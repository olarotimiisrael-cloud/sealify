@extends('layouts.app')

@section('content')
    <div class="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <x-form-card title="Settings" subtitle="Manage your account preferences.">
            <form method="POST" action="{{ route('profile.update') }}" class="space-y-6">
                @csrf
                @method('PUT')

                <div>
                    <label class="block text-sm font-medium text-slate-700">Full Name</label>
                    <input name="name" type="text" value="{{ old('name', auth()->user()->name ?? '') }}"
                           class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700">Email</label>
                    <input name="email" type="email" value="{{ old('email', auth()->user()->email ?? '') }}"
                           class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700">Phone</label>
                    <input name="phone" type="tel" value="{{ old('phone', auth()->user()->phone ?? '') }}"
                           class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700">Location</label>
                    <input name="location" type="text" value="{{ old('location', auth()->user()->location ?? '') }}"
                           class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                </div>

                <button type="submit" class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                    Save Changes
                </button>
            </form>

            <div class="mt-10 pt-8 border-t border-slate-100">
                <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Change Password</h3>
                <form method="POST" action="{{ route('password.change') }}" class="space-y-4">
                    @csrf
                    <div>
                        <label class="block text-sm font-medium text-slate-700">Current Password</label>
                        <input name="current_password" type="password" required
                               class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700">New Password</label>
                        <input name="password" type="password" required minlength="8"
                               class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700">Confirm New Password</label>
                        <input name="password_confirmation" type="password" required minlength="8"
                               class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                    </div>
                    <button type="submit" class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                        Update Password
                    </button>
                </form>
            </div>

            <div class="mt-10 pt-8 border-t border-slate-100">
                <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Phone Verification</h3>
                <p class="text-xs text-slate-600 mb-4">Verify your phone number with a 6-digit OTP code. No third-party SMS provider - codes are generated locally and can be viewed in the Admin Panel > SMS OTP.</p>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700">Phone Number</label>
                        <input name="phone" type="tel" id="otp-phone"
                               value="{{ old('phone', auth()->user()->phone ?? '') }}"
                               placeholder="+234 812 345 6789"
                               class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                    </div>
                    
                    <div class="flex gap-3">
                        <button type="button" onclick="requestOtp()"
                                class="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                            Request OTP Code
                        </button>
                    </div>
                    
                    <div id="otp-verify-section" class="hidden space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700">Enter 6-Digit OTP Code</label>
                            <input name="otp_code" type="text" id="otp-code"
                                   maxlength="6"
                                   placeholder="123456"
                                   class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 font-mono text-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        </div>
                        <button type="button" onclick="verifyOtp()"
                                class="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                            Verify Phone Number
                        </button>
                    </div>
                </div>
                
                @if(auth()->user()->phone_verified_at)
                    <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                        <div class="flex items-center gap-3">
                            <span class="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm">✓</span>
                            <div>
                                <p class="font-bold text-slate-900 text-sm">Phone Verified</p>
                                <p class="text-xs text-emerald-600">{{ auth()->user()->phone_verified_at->format('M d, Y h:i A') }}</p>
                            </div>
                        </div>
                    </div>
                @endif
            </div>
        </x-form-card>
    </div>
@endsection

<script>
function requestOtp() {
    const phone = document.getElementById('otp-phone').value;
    if (!phone) {
        alert('Please enter a phone number first.');
        return;
    }
    
    const btn = event.target;
    btn.disabled = true;
    btn.innerHTML = 'Sending...';
    
    fetch('{{ route('phone.otp.request') }}', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
        },
        body: new URLSearchParams({
            'phone_number': phone,
            'purpose': 'verification'
        })
    })
    .then(response => response.json())
    .then(data => {
        btn.disabled = false;
        btn.innerHTML = 'Request OTP Code';
        if (data.status) {
            document.getElementById('otp-verify-section').classList.remove('hidden');
            alert(data.status);
        } else {
            alert('Failed to request OTP.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        btn.disabled = false;
        btn.innerHTML = 'Request OTP Code';
        alert('Failed to request OTP.');
    });
}

function verifyOtp() {
    const phone = document.getElementById('otp-phone').value;
    const otpCode = document.getElementById('otp-code').value;
    
    if (!phone || !otpCode) {
        alert('Please enter both phone number and OTP code.');
        return;
    }
    
    const btn = event.target;
    btn.disabled = true;
    btn.innerHTML = 'Verifying...';
    
    fetch('{{ route('phone.otp.verify') }}', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
        },
        body: new URLSearchParams({
            'phone_number': phone,
            'otp_code': otpCode,
            'purpose': 'verification'
        })
    })
    .then(response => response.json())
    .then(data => {
        btn.disabled = false;
        btn.innerHTML = 'Verify Phone Number';
        if (data.status) {
            location.reload();
        } else {
            alert(data.errors?.otp_code?.[0] || 'Failed to verify OTP.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        btn.disabled = false;
        btn.innerHTML = 'Verify Phone Number';
        alert('Failed to verify OTP.');
    });
}
</script>
