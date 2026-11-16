@extends('layouts.app')

@section('content')
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-6">
            <h1 class="text-2xl font-black text-slate-900">Identity Verification (KYC)</h1>
            <p class="text-slate-600">Submit a valid government-issued ID to get verified. An admin will review your submission before assigning a badge.</p>
        </div>

        @if (session('status'))
            <div class="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {{ session('status') }}
            </div>
        @endif

        @if ($errors->any())
            <div class="mb-6 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <ul class="list-disc list-inside space-y-1">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        {{-- Current status --}}
        @if ($latest)
            <div class="mb-6 bg-white shadow-sm rounded-2xl border border-slate-100 p-6">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <p class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Latest Submission</p>
                        <p class="font-bold text-slate-900">{{ $latest->typeLabel() }}</p>
                        <p class="text-sm text-slate-600 mt-1">Reference: {{ $latest->provider_reference }}</p>
                        <p class="text-sm text-slate-600">Submitted: {{ $latest->created_at?->format('M j, Y g:i A') }}</p>
                        @if ($latest->rejection_reason)
                            <p class="text-sm text-rose-600 mt-2"><strong>Reason:</strong> {{ $latest->rejection_reason }}</p>
                        @endif
                        @if ($latest->review_notes)
                            <p class="text-sm text-slate-600 mt-1"><strong>Admin note:</strong> {{ $latest->review_notes }}</p>
                        @endif
                    </div>
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold {{ $latest->statusColorClass() }}">
                        {{ $latest->statusLabel() }}
                    </span>
                </div>
            </div>
        @endif

        @if ($user->isKycVerified())
            <div class="bg-white shadow-sm rounded-2xl border border-emerald-100 p-8 text-center">
                <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h2 class="text-xl font-bold text-slate-900 mb-1">You are verified</h2>
                <p class="text-slate-600">Your identity was verified on {{ $user->kyc_verified_at?->format('M j, Y') }} via {{ strtoupper($user->kyc_type ?? 'ID') }}.</p>
                @if ($user->hasBadge())
                    <div class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-{{ $user->badgeColor() }}-100 text-{{ $user->badgeColor() }}-700">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.264.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                        {{ $user->badgeLabel() }}
                    </div>
                @endif
            </div>
        @elseif ($latest && $latest->isPending())
            <div class="bg-white shadow-sm rounded-2xl border border-amber-100 p-8 text-center">
                <div class="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
                    <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h2 class="text-xl font-bold text-slate-900 mb-1">Submission under review</h2>
                <p class="text-slate-600">An admin is reviewing your submitted ID. You will be notified once a decision is made.</p>
            </div>
        @else
            <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-8">
                <h2 class="text-xl font-bold text-slate-900 mb-1">Submit your government ID</h2>
                <p class="text-sm text-slate-600 mb-6">Accepted documents: NIN slip/card, Driver's License, Voter's Card, International Passport, or CAC certificate. Maximum size 5MB.</p>

                <form method="POST" action="{{ route('kyc.submit') }}" enctype="multipart/form-data" class="space-y-5">
                    @csrf

                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">ID Type</label>
                        <select name="type" id="kyc-type" required class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                            <option value="" disabled {{ old('type') ? '' : 'selected' }}>Select an ID type</option>
                            @foreach (\App\Models\KycVerification::typeLabels() as $key => $label)
                                <option value="{{ $key }}" {{ old('type') === $key ? 'selected' : '' }}>{{ $label }}</option>
                            @endforeach
                        </select>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">ID Number</label>
                        <input name="id_number" type="text" required inputmode="numeric" maxlength="20"
                               value="{{ old('id_number') }}"
                               placeholder="Enter the ID number exactly as shown"
                               class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        <p class="text-xs text-slate-500 mt-1">Only the last 4 digits are stored. Your full number is hashed for duplicate detection.</p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4" id="name-fields">
                        <div>
                            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">First Name</label>
                            <input name="first_name" type="text" value="{{ old('first_name') }}"
                                   class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Last Name</label>
                            <input name="last_name" type="text" value="{{ old('last_name') }}"
                                   class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Date of Birth <span class="text-slate-400 normal-case font-normal">(optional)</span></label>
                        <input name="date_of_birth" type="date" value="{{ old('date_of_birth') }}"
                               class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Upload ID Document</label>
                        <input name="document" type="file" required accept="image/*,.pdf"
                               class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-sm file:font-bold file:text-slate-950 hover:file:bg-emerald-400">
                        <p class="text-xs text-slate-500 mt-1">Clear photo or scan of the front of your ID. JPG, PNG, or PDF up to 5MB. Your document is only visible to Sealify admins.</p>
                    </div>

                    <div class="pt-2">
                        <button type="submit"
                                class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                            Submit for Review
                        </button>
                    </div>
                </form>
            </div>
        @endif
    </div>

    @push('scripts')
    <script>
        (function () {
            const type = document.getElementById('kyc-type');
            const nameFields = document.getElementById('name-fields');
            if (!type || !nameFields) return;
            const sync = () => {
                const isCac = type.value === 'cac';
                nameFields.querySelectorAll('input').forEach((input) => {
                    input.required = !isCac;
                    input.closest('div').style.opacity = isCac ? '0.5' : '1';
                });
            };
            type.addEventListener('change', sync);
            sync();
        })();
    </script>
    @endpush
@endsection
