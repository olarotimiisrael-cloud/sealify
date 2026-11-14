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
        </x-form-card>
    </div>
@endsection
