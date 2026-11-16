@extends('layouts.app')

@section('content')
    <div class="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-slate-900">Account Settings</h2>
        </div>

        <!-- Profile Section -->
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-6 mb-6">
            <h3 class="text-lg font-bold text-slate-900 mb-4">Profile Information</h3>
            <form method="POST" action="{{ route('profile.update') }}" class="space-y-4">
                @csrf
                @method('PUT')
                <div>
                    <label class="block text-sm font-medium text-slate-700">Full Name</label>
                    <input name="name" type="text" value="{{ old('name', $user->name ?? '') }}"
                           class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700">Email</label>
                    <input name="email" type="email" value="{{ old('email', $user->email ?? '') }}"
                           class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700">Phone</label>
                    <input name="phone" type="tel" value="{{ old('phone', $user->phone ?? '') }}"
                           class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700">Location</label>
                    <input name="location" type="text" value="{{ old('location', $user->location ?? '') }}"
                           class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700">Bio</label>
                    <textarea name="bio" rows="3"
                              class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">{{ old('bio', $user->bio ?? '') }}</textarea>
                </div>
                <button type="submit" class="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                    Save Profile
                </button>
            </form>
        </div>

        <!-- App Lock (Biometric / Face ID) -->
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-6 mb-6">
            <h3 class="text-lg font-bold text-slate-900 mb-4">App Lock</h3>
            <p class="text-xs text-slate-500 mb-4">Secure your app with biometric or face recognition. Requires a supported device with biometric hardware.</p>
            <div class="space-y-4">
                <!-- Biometric Lock -->
                <div class="flex items-center justify-between p-4 rounded-xl {{ $user->biometric_lock_enabled ? 'bg-emerald-50' : 'bg-slate-50' }}">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full {{ $user->biometric_lock_enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500' }} flex items-center justify-center">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-slate-900">Fingerprint Lock</p>
                            <p class="text-xs text-slate-500">{{ $user->biometric_lock_enabled ? 'Enabled — biometric registered ' . $user->biometric_registered_at?->diffForHumans() : 'Use fingerprint to unlock the app' }}</p>
                        </div>
                    </div>
                    <form method="POST" action="{{ route('settings.biometric.toggle') }}">
                        @csrf
                        <button type="submit" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {{ $user->biometric_lock_enabled ? 'bg-emerald-500' : 'bg-slate-300' }}">
                            <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {{ $user->biometric_lock_enabled ? 'translate-x-6' : 'translate-x-1' }}"></span>
                        </button>
                    </form>
                </div>
                <div class="text-xs text-slate-400 ml-13 pl-1">
                    @if(!$user->biometric_lock_enabled)
                        <button type="button" onclick="registerBiometric()" class="text-emerald-600 font-bold hover:underline">Register Fingerprint →</button>
                    @elseif(!$user->biometric_registered_at)
                        <button type="button" onclick="registerBiometric()" class="text-amber-600 font-bold hover:underline">Register fingerprint to activate →</button>
                    @endif
                </div>

                <!-- Face ID Lock -->
                <div class="flex items-center justify-between p-4 rounded-xl {{ $user->face_id_lock_enabled ? 'bg-emerald-50' : 'bg-slate-50' }}">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full {{ $user->face_id_lock_enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500' }} flex items-center justify-center">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-slate-900">Face ID Lock</p>
                            <p class="text-xs text-slate-500">{{ $user->face_id_lock_enabled ? 'Enabled — face registered ' . $user->face_id_registered_at?->diffForHumans() : 'Use face recognition to unlock the app' }}</p>
                        </div>
                    </div>
                    <form method="POST" action="{{ route('settings.face-id.toggle') }}">
                        @csrf
                        <button type="submit" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {{ $user->face_id_lock_enabled ? 'bg-emerald-500' : 'bg-slate-300' }}">
                            <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {{ $user->face_id_lock_enabled ? 'translate-x-6' : 'translate-x-1' }}"></span>
                        </button>
                    </form>
                </div>
                <div class="text-xs text-slate-400 ml-13 pl-1">
                    @if(!$user->face_id_lock_enabled)
                        <button type="button" onclick="registerFaceId()" class="text-emerald-600 font-bold hover:underline">Register Face →</button>
                    @elseif(!$user->face_id_registered_at)
                        <button type="button" onclick="registerFaceId()" class="text-amber-600 font-bold hover:underline">Register face to activate →</button>
                    @endif
                </div>
            </div>
        </div>

        <!-- Change Password -->
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-6 mb-6">
            <h3 class="text-lg font-bold text-slate-900 mb-4">Change Password</h3>
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
                <button type="submit" class="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                    Update Password
                </button>
            </form>
        </div>

        <!-- Notification Preferences -->
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-6 mb-6">
            <h3 class="text-lg font-bold text-slate-900 mb-4">Notification Preferences</h3>
            <div class="space-y-3">
                <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <div>
                        <p class="text-sm font-medium text-slate-900">Email Notifications</p>
                        <p class="text-xs text-slate-500">Receive email alerts for messages and updates</p>
                    </div>
                    <form method="POST" action="{{ route('settings.biometric.toggle') }}">
                        @csrf
                        <button type="submit" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {{ $user->email_notifications ? 'bg-emerald-500' : 'bg-slate-300' }}">
                            <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {{ $user->email_notifications ? 'translate-x-6' : 'translate-x-1' }}"></span>
                        </button>
                    </form>
                </div>
                <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <div>
                        <p class="text-sm font-medium text-slate-900">WhatsApp Notifications</p>
                        <p class="text-xs text-slate-500">Receive WhatsApp alerts for messages</p>
                    </div>
                    <form method="POST" action="{{ route('settings.biometric.toggle') }}">
                        @csrf
                        <button type="submit" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {{ $user->whatsapp_notifications ? 'bg-emerald-500' : 'bg-slate-300' }}">
                            <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {{ $user->whatsapp_notifications ? 'translate-x-6' : 'translate-x-1' }}"></span>
                        </button>
                    </form>
                </div>
                <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <div>
                        <p class="text-sm font-medium text-slate-900">Hide Phone Publicly</p>
                        <p class="text-xs text-slate-500">Don't show phone number on your profile</p>
                    </div>
                    <form method="POST" action="{{ route('settings.biometric.toggle') }}">
                        @csrf
                        <button type="submit" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {{ $user->hide_phone_publicly ? 'bg-emerald-500' : 'bg-slate-300' }}">
                            <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {{ $user->hide_phone_publicly ? 'translate-x-6' : 'translate-x-1' }}"></span>
                        </button>
                    </form>
                </div>
            </div>
        </div>

        <!-- Account Actions -->
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-6 mb-6">
            <h3 class="text-lg font-bold text-slate-900 mb-4">Account Actions</h3>
            <div class="space-y-3">
                <a href="{{ route('dashboard') }}" class="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors">
                    <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                    </div>
                    <div class="flex-1">
                        <p class="text-sm font-bold text-slate-900">Go to Dashboard</p>
                        <p class="text-xs text-slate-500">View your stats and quick actions</p>
                    </div>
                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </a>
                <a href="{{ route('profile.show') }}" class="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div class="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    </div>
                    <div class="flex-1">
                        <p class="text-sm font-bold text-slate-900">View Public Profile</p>
                        <p class="text-xs text-slate-500">See how others view your profile</p>
                    </div>
                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </a>
                <a href="{{ route('business.profile') }}" class="flex items-center gap-3 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
                    <div class="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                    </div>
                    <div class="flex-1">
                        <p class="text-sm font-bold text-slate-900">Business Profile</p>
                        <p class="text-xs text-slate-500">Manage your business details and verification</p>
                    </div>
                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </a>
                <a href="{{ route('kyc.index') }}" class="flex items-center gap-3 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors">
                    <div class="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <div class="flex-1">
                        <p class="text-sm font-bold text-slate-900">Identity Verification (KYC)</p>
                        <p class="text-xs text-slate-500">{{ $user->isKycVerified() ? 'Verified ✓' : 'Submit your ID for verification' }}</p>
                    </div>
                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </a>
                <form method="POST" action="{{ route('logout') }}" class="block">
                    @csrf
                    <button type="submit" class="w-full flex items-center gap-3 p-4 rounded-xl bg-rose-50 hover:bg-rose-100 transition-colors text-rose-600">
                        <div class="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                        </div>
                        <div class="flex-1 text-left">
                            <p class="text-sm font-bold">Logout</p>
                            <p class="text-xs text-rose-400">Sign out of your account</p>
                        </div>
                    </button>
                </form>
            </div>
        </div>
    </div>

    <script>
    async function registerBiometric() {
        try {
            if (!window.PublicKeyCredential) {
                alert('Your browser does not support biometric authentication.');
                return;
            }
            const publicKey = {
                challenge: new Uint8Array(32),
                rp: { name: 'Sealify', id: window.location.hostname },
                user: {
                    id: new TextEncoder().encode('{{ $user->id }}'),
                    name: '{{ $user->email }}',
                    displayName: '{{ $user->name }}',
                },
                pubKeyCredParams: [
                    { alg: -7, type: 'public-key' },
                    { alg: -257, type: 'public-key' },
                ],
                authenticatorSelection: { authenticatorAttachment: 'platform' },
                timeout: 60000,
                attestation: 'none',
            };
            const credential = await navigator.credentials.create({ publicKey });
            const publicKeyB64 = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
            await fetch('{{ route('settings.biometric.register') }}', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ public_key: publicKeyB64 }),
            }).then(() => location.reload());
        } catch (err) {
            console.error('Biometric registration error:', err);
            alert('Biometric registration failed: ' + err.message);
        }
    }

    async function registerFaceId() {
        try {
            if (!window.PublicKeyCredential) {
                alert('Your browser does not support Face ID authentication.');
                return;
            }
            const publicKey = {
                challenge: new Uint8Array(32),
                rp: { name: 'Sealify', id: window.location.hostname },
                user: {
                    id: new TextEncoder().encode('{{ $user->id }}'),
                    name: '{{ $user->email }}',
                    displayName: '{{ $user->name }}',
                },
                pubKeyCredParams: [
                    { alg: -7, type: 'public-key' },
                    { alg: -257, type: 'public-key' },
                ],
                authenticatorSelection: { authenticatorAttachment: 'platform' },
                timeout: 60000,
                attestation: 'none',
            };
            const credential = await navigator.credentials.create({ publicKey });
            const publicKeyB64 = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
            await fetch('{{ route('settings.face-id.register') }}', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ public_key: publicKeyB64 }),
            }).then(() => location.reload());
        } catch (err) {
            console.error('Face ID registration error:', err);
            alert('Face ID registration failed: ' + err.message);
        }
    }
    </script>
@endsection