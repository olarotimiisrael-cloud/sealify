@extends('layouts.admin')

@section('adminContent')
<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between mb-8">
        <div>
            <h1 class="text-3xl font-black text-slate-900 mb-2">Edit User</h1>
            <p class="text-slate-600">Manage user account details and verified badges.</p>
        </div>
        <a href="{{ route('admin.users') }}" class="text-sm text-emerald-600 font-bold hover:underline">← Back to Users</a>
    </div>

    <x-form-card title="User Information" subtitle="Edit account details for {{ $user->name }}">
        <form method="POST" action="{{ route('admin.users.update', $user) }}" class="space-y-8">
            @csrf
            @method('PUT')

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                    <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Full Name</label>
                    <input name="name" type="text" required
                           value="{{ old('name', $user->name) }}"
                           class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Email</label>
                    <input name="email" type="email" required
                           value="{{ old('email', $user->email) }}"
                           class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Phone</label>
                    <input name="phone" type="tel"
                           value="{{ old('phone', $user->phone) }}"
                           class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Status</label>
                    <select name="status" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        <option value="active" {{ old('status', $user->status) === 'active' ? 'selected' : '' }}>Active</option>
                        <option value="suspended" {{ old('status', $user->status) === 'suspended' ? 'selected' : '' }}>Suspended</option>
                        <option value="banned" {{ old('status', $user->status) === 'banned' ? 'selected' : '' }}>Banned</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Role</label>
                    <select name="role" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        <option value="user" {{ old('role', $user->role) === 'user' ? 'selected' : '' }}>User</option>
                        <option value="admin" {{ old('role', $user->role) === 'admin' ? 'selected' : '' }}>Admin</option>
                    </select>
                </div>

                <div class="lg:col-span-2">
                    <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Verified Badge</label>
                    <select name="badge" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        <option value="" {{ old('badge', $user->badge) === '' || old('badge', $user->badge) === null ? 'selected' : '' }}>None</option>
                        @foreach ($badges as $key => $label)
                            <option value="{{ $key }}" {{ old('badge', $user->badge) === $key ? 'selected' : '' }}>
                                {{ $label }}
                            </option>
                        @endforeach
                    </select>
                    <p class="text-xs text-slate-500 mt-1">Available badges: Business, Vendor, Sealify Official, Sealify Staff, Sealify Officer</p>
                </div>

                <div class="lg:col-span-2">
                    <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Bio</label>
                    <textarea name="bio" rows="4"
                              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">{{ old('bio', $user->bio) }}</textarea>
                </div>

                <div class="lg:col-span-2">
                    <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Location</label>
                    <input name="location" type="text"
                           value="{{ old('location', $user->location) }}"
                           class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                </div>

                <!-- Business Details -->
                <div class="lg:col-span-2">
                    <div class="flex items-center gap-2 mb-3">
                        <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 9.351 9.246 9.161 8.234 7.621C7.21 6.1 6 4.522 6 2.866c0-1.691 1.35-3.076 3.02-3.254C9.531 0 10.903 0 12.124 0c1.219 0 2.589.024 3.83.714 1.794.841 2.949 2.382 3.032 4.005C18.002 5.409 19.598 6.94 20 8.67c0 1.658-1.293 3.04-2.859 3.498-1.13.33-2.298.39-3.508.39-1.208 0-2.4-.25-3.518-.748-1.017-.44-2.01-.99-2.84-1.654C9.999 6.058 11.002 7.304 11.5 8.504c.391.904.585 1.849.585 2.868 0 1.02-.15 1.998-.455 2.948C10.887 12.454 10.567 13.52 10.223 14.5c-.343.98-.514 1.98-.514 3.003v1.5c0 1.297.113 2.547.33 3.76.319 1.808 1.074 3.524 2.126 4.803a12 12 0 001.317 1.481c.672.591 1.439 1.08 2.273 1.446a22.6 22.6 0 002.588.373c1.269 0 2.535-.127 3.79-.364a22 22 0 002.177-.885c.91-.487 1.74-1.076 2.473-1.766a22.7 22.7 0 002.245-2.044c.567-.835.877-1.787.877-2.828v-1.5c0-1.022-.153-2.003-.44-2.947a12 12 0 00-1.316-1.486c-.672-.591-1.439-1.08-2.273-1.445a22.4 22.4 0 00-2.588-.374c-1.269.001-2.535.126-3.79.365a22 22 0 00-2.177.884c-.91.487-1.74 1.075-2.473 1.765a22.8 22.8 0 00-2.245 2.043c-.567.835-.877 1.786-.877 2.828v1.5c0 1.023.153 2.004.44 2.948a12 12 0 001.316 1.487c.672.59 1.439 1.079 2.273 1.444a22.6 22.6 0 002.588.374c1.269 0 2.535-.126 3.79-.364a22 22 0 002.177-.885c.91-.487 1.74-1.076 2.473-1.766a22.7 22.7 0 002.245-2.044c.567-.835.877-1.787.877-2.828v-1.5c0-1.021-.153-2.002-.44-2.946a12 12 0 00-1.316-1.485c-.672-.591-1.439-1.08-2.273-1.445a22.4 22.4 0 00-2.588-.373c-1.269 0-2.535.126-3.79.363a22 22 0 00-2.177.886c-.91.487-1.74 1.075-2.473 1.765a22.8 22.7 0 00-2.245 2.044c-.567.836-.877 1.788-.877 2.829v1.5c0 1.022.153 2.003.44 2.947a12 12 0 001.316 1.486c.672.591 1.439 1.08 2.273 1.446a22.6 22.6 0 002.588.372c1.269 0 2.535-.127 3.79-.364a22 22 0 002.177-.884c.91-.487 1.74-1.076 2.473-1.766a22.7 22.7 0 002.245-2.043c.567-.835.877-1.787.877-2.828v-1.5c0-1.021-.153-2.002-.44-2.946a12 12 0 00-1.316-1.485c-.672-.591-1.439-1.08-2.273-1.445a22.4 22.4 0 00-2.588-.373c-1.269 0-2.535.126-3.79.363a22 22 0 00-2.177.885c-.91.487-1.74 1.076-2.473 1.766a22.7 22.7 0 00-2.245 2.043c-.567.836-.877 1.788-.877 2.829z"></path></svg>
                        <span class="font-semibold text-slate-900">Business Details</span>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-3">
                        <div>
                            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Business Name</label>
                            <input name="business_name" type="text"
                                   value="{{ old('business_name', $user->business_name) }}"
                                   class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Business Category</label>
                            <input name="business_category" type="text"
                                   value="{{ old('business_category', $user->business_category) }}"
                                   class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">CAC Number</label>
                            <input name="cac_number" type="text"
                                   value="{{ old('cac_number', $user->cac_number) }}"
                                   class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        </div>
                        <div class="sm:col-span-2">
                            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Business Address</label>
                            <input name="business_address" type="text"
                                   value="{{ old('business_address', $user->business_address) }}"
                                   class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Business Hours</label>
                            <input name="business_hours" type="text"
                                   value="{{ old('business_hours', $user->business_hours) }}"
                                   class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Website URL</label>
                            <input name="website_url" type="url"
                                   value="{{ old('website_url', $user->website_url) }}"
                                   class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Instagram</label>
                            <input name="instagram_handle" type="text"
                                   value="{{ old('instagram_handle', $user->instagram_handle) }}"
                                   class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Twitter</label>
                            <input name="twitter_handle" type="text"
                                   value="{{ old('twitter_handle', $user->twitter_handle) }}"
                                   class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">WhatsApp</label>
                            <input name="whatsapp_number" type="tel"
                                   value="{{ old('whatsapp_number', $user->whatsapp_number) }}"
                                   class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        </div>
                    </div>
                </div>
            </div>

            <div class="pt-6 border-t border-slate-100 flex gap-3">
                <button type="submit"
                        class="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                    Update User
                </button>
                <form method="POST" action="{{ route('admin.users.destroy', $user) }}" onsubmit="return confirm('Are you sure you want to delete this user?')" class="inline">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="bg-rose-500 hover:bg-rose-600 text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-lg shadow-rose-200 hover:shadow-rose-300">
                        Delete User
                    </button>
                </form>
                <a href="{{ route('admin.users') }}" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-8 py-3 rounded-xl transition-colors">
                    Cancel
                </a>
            </div>
        </form>
    </x-form-card>
</div>
@endsection
