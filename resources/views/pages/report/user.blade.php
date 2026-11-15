@extends('layouts.app')

@section('content')
<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
        <div class="flex items-center justify-between mb-6">
            <div>
                <a href="{{ route('users.show', $user) }}" class="text-sm text-emerald-600 font-bold hover:underline">
                    ← Back to Profile
                </a>
            </div>
        </div>

        <h2 class="text-2xl font-black text-slate-900 mb-2">Report User</h2>
        <p class="text-slate-600 mb-6">
            <strong>{{ $user->name }}</strong> (@{{ $user->username ?? $user->email }})
        </p>

        <form method="POST" action="{{ route('reports.storeUser', $user) }}" enctype="multipart/form-data" class="space-y-6">
            @csrf

            <!-- Report Type / Reason -->
            <div>
                <label for="reason" class="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                    What is the issue?
                </label>
                <select name="reason" id="reason" required
                        class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                    <option value="">Select a reason...</option>
                    <option value="fraudulent_user">Fraudulent or scamming behavior</option>
                    <option value="fake_profile">Fake or impersonating profile</option>
                    <option value="harassment">Harassment or abusive behavior</option>
                    <option value="inappropriate_content">Inappropriate content or photos</option>
                    <option value="selling_prohibited_items">Selling prohibited or illegal items</option>
                    <option value="drug_dealing">Drug dealing or substance abuse</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <!-- Details -->
            <div>
                <label for="details" class="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Additional Details
                </label>
                <textarea name="details" id="details" rows="5" required
                          placeholder="Please describe the issue in detail..."
                          class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"></textarea>
                <p class="text-xs text-slate-500 mt-1">
                    Include dates, times, specific incidents, and any other relevant information.
                </p>
            </div>

            <!-- Evidence Upload -->
            <div>
                <label for="evidence_file" class="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Evidence (Optional)
                </label>
                <input type="file" name="evidence_file" id="evidence_file" accept="image/*,application/pdf"
                       class="block w-full text-sm text-slate-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-emerald-50 file:text-emerald-700
                       hover:file:bg-emerald-100">
                <p class="text-xs text-slate-500 mt-1">
                    Upload chat screenshots, photos, or documents as evidence (max 10MB).
                </p>
            </div>

            <button type="submit"
                    class="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                Submit Report
            </button>
        </form>
    </div>
</div>
@endsection
