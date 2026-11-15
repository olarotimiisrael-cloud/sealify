@extends('layouts.app')

@section('content')
<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
        <div class="flex items-center justify-between mb-6">
            <div>
                <a href="{{ route('home') }}" class="text-sm text-emerald-600 font-bold hover:underline">
                    ← Back to Home
                </a>
            </div>
        </div>

        <h2 class="text-2xl font-black text-slate-900 mb-2">Report a Concern</h2>
        <p class="text-slate-600 mb-6">
            Help us keep Sealify safe. Report illegal activities, suspicious behavior, or safety concerns.
        </p>

        <form method="POST" action="{{ route('reports.storeConcern') }}" enctype="multipart/form-data" class="space-y-6">
            @csrf

            <!-- Report Type -->
            <div>
                <label for="report_type" class="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                    What type of concern?
                </label>
                <select name="report_type" id="report_type" required
                        class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                    <option value="">Select a concern type...</option>
                    <option value="drugs">Illegal Drugs or Substances</option>
                    <option value="fraud">Fraud or Scam</option>
                    <option value="scam">Online Scam or Phishing</option>
                    <option value="other">Other Illegal Activity</option>
                </select>
            </div>

            <!-- Details -->
            <div>
                <label for="details" class="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Describe the Concern
                </label>
                <textarea name="details" id="details" rows="5" required
                          placeholder="Please provide detailed information about the illegal activity..."
                          class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"></textarea>
                <p class="text-xs text-slate-500 mt-1">
                    Include names, dates, locations, usernames, listing titles, and any other relevant information.
                </p>
            </div>

            <!-- Evidence Upload -->
            <div>
                <label for="evidence_file" class="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Evidence (Optional)
                </label>
                <input type="file" name="evidence_file" id="evidence_file" accept="image/*,application/pdf,video/*"
                       class="block w-full text-sm text-slate-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-emerald-50 file:text-emerald-700
                       hover:file:bg-emerald-100">
                <p class="text-xs text-slate-500 mt-1">
                    Upload photos, videos, screenshots, or documents as evidence (max 10MB).
                </p>
            </div>

            <button type="submit"
                    class="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                Submit Report
            </button>
        </form>
    </div>

    <!-- Info Box -->
    <div class="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
        <h3 class="text-lg font-bold text-slate-900 mb-2">Emergency?</h3>
        <p class="text-slate-600 mb-4">
            If this is an emergency or life-threatening situation, please contact local law enforcement immediately.
        </p>
        <div class="flex items-center gap-4 text-sm text-slate-700">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>Sealify does not handle emergency situations. Contact police for immediate threats.</span>
        </div>
    </div>
</div>
@endsection
