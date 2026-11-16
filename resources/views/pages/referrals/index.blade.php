@extends('layouts.app')

@section('content')
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-8 mb-6">
            <h2 class="text-2xl font-bold text-slate-900 mb-2">Referral & Free Promotion</h2>
            <p class="text-slate-600 mb-6">Earn a free 1-week ad promotion after 10 successful referrals. Double your promotion to 2 weeks after 20 referrals.</p>

            <div class="p-6 rounded-xl border border-slate-100 bg-slate-50 text-center mb-6">
                <p class="text-sm text-slate-600 mb-4">Your referral link:</p>
                <div class="flex items-center justify-center gap-2">
                    <code class="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-emerald-700">{{ $referralLink }}</code>
                    <button type="button" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg transition-colors" onclick="navigator.clipboard.writeText('{{ $referralLink }}'); alert('Referral link copied!');">
                        Copy
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="p-4 rounded-xl border border-slate-100 bg-slate-50 text-center">
                    <div class="text-2xl font-bold text-slate-900">{{ $referralStatus['count'] }}</div>
                    <div class="text-xs text-slate-500">Successful Referrals</div>
                </div>
                <div class="p-4 rounded-xl border border-slate-100 bg-slate-50 text-center">
                    <div class="text-2xl font-bold text-slate-900">{{ $referralStatus['next_milestone'] ?? 'Done' }}</div>
                    <div class="text-xs text-slate-500">Next Milestone</div>
                </div>
                <div class="p-4 rounded-xl border border-slate-100 bg-slate-50 text-center">
                    <div class="text-2xl font-bold text-slate-900">{{ round($referralStatus['progress']) }}%</div>
                    <div class="text-xs text-slate-500">Progress to 2-Week Promotion</div>
                </div>
            </div>

            <div class="mt-6">
                @if ($referralStatus['can_claim_1_week'])
                    <a href="{{ route('listings.my') }}" class="block w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-center transition-all">
                        🎉 Claim Your 1-Week Free Promotion
                    </a>
                @elseif ($referralStatus['can_claim_2_weeks'])
                    <a href="{{ route('listings.my') }}" class="block w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-center transition-all">
                        🎉 Claim Your 2-Week Free Promotion
                    </a>
                @else
                    <p class="text-center text-sm text-slate-500">Keep inviting friends through your unique referral link to unlock a free ad promotion.</p>
                @endif
            </div>
        </div>

        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-8">
            <h3 class="text-xl font-bold text-slate-900 mb-6">Referral History</h3>
            @if ($referrals->isEmpty())
                <p class="text-slate-500 text-center py-8">No successful referrals yet.</p>
            @else
                <ul class="space-y-4">
                    @foreach ($referrals as $referral)
                        <li class="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
                            <div>
                                <p class="font-bold text-sm text-slate-900">{{ $referral->referee->name ?? 'User' }}</p>
                                <p class="text-xs text-slate-500">{{ $referral->created_at->diffForHumans() }}</p>
                            </div>
                            <span class="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 uppercase">{{ $referral->status }}</span>
                        </li>
                    @endforeach
                </ul>
                <div class="mt-4">{{ $referrals->links() }}</div>
            @endif
        </div>
    </div>
@endsection