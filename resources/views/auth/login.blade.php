<x-guest-layout>
    <x-form-card title="Sign in to Sealify" subtitle="Welcome back. Buy, sell, and connect locally.">
        <div class="flex items-center justify-center mb-6">
            @include('partials.sealify-logo', ['size' => 'lg'])
        </div>

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

        <form method="POST" action="{{ route('login.submit') }}" class="space-y-4">
            @csrf

            <div>
                <label for="email" class="block text-sm font-medium text-slate-700">Email</label>
                <input id="email" name="email" type="email" required
                       value="{{ old('email') }}"
                       class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors">
            </div>

            <div>
                <label for="password" class="block text-sm font-medium text-slate-700">Password</label>
                <input id="password" name="password" type="password" required minlength="6"
                       class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors">
            </div>

            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <input id="remember" name="remember" type="checkbox" class="w-4 h-4 text-emerald-600 rounded border-slate-200">
                    <label for="remember" class="ml-2 text-sm text-slate-600">Remember me</label>
                </div>
                <a href="{{ route('password.request') }}" class="text-xs text-emerald-600 font-bold hover:underline">Forgot password?</a>
            </div>

        <button type="submit"
                class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
            Sign In
        </button>
        </form>

        <div class="mt-8 text-center">
            <p class="text-xs text-slate-500">Don't have an account?</p>
            <a href="{{ route('register') }}" class="text-emerald-600 font-bold text-xs hover:underline">Sign Up</a>
        </div>
    </x-form-card>
</x-guest-layout>
