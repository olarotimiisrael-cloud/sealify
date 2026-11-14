<x-guest-layout>
    <x-form-card title="Verify Your Email" subtitle="A 6-digit code was sent to your email. Enter it below to verify.">
        @if (session('status'))
            <div class="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm">
                {{ session('status') }}
            </div>
        @endif

        @if ($errors->any())
            <div class="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm">
                <ul class="list-disc list-inside space-y-1">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <form method="POST" action="{{ route('verify.submit') }}" class="space-y-4">
            @csrf

            <div>
                <label for="email" class="block text-sm font-medium text-slate-700">Email</label>
                <input id="email" name="email" type="email" required
                       value="{{ old('email') }}"
                       class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors">
            </div>

            <div>
                <label for="code" class="block text-sm font-medium text-slate-700">6-Digit Code</label>
                <input id="code" name="code" type="text" required maxlength="6" pattern="[0-9]{6}"
                       class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                       placeholder="123456">
            </div>

            <button type="submit"
                    class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                Verify Email
            </button>
        </form>

        <div class="mt-6 text-center">
            <p class="text-xs text-slate-500">Didn't receive a code?</p>
            <a href="{{ route('resend') }}" class="text-emerald-600 font-bold text-xs hover:underline">Resend Code</a>
        </div>

        <div class="mt-6 text-center">
            <p class="text-xs text-slate-500">Already verified?</p>
            <a href="{{ route('login') }}" class="text-emerald-600 font-bold text-xs hover:underline">Sign In</a>
        </div>
    </x-form-card>
</x-guest-layout>
