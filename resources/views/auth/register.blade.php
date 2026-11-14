<x-guest-layout>
    <div class="max-w-md mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-8">
            <div class="text-center mb-8">
                <div class="flex items-center justify-center gap-2">
                    <img src="{{ asset('logo.png') }}" alt="Sealify" class="h-8 w-auto">
                    <span class="text-emerald-600 font-black text-xl tracking-tight">Sealify</span>
                </div>
                <h2 class="mt-4 text-2xl font-bold text-slate-900">Create an account</h2>
                <p class="mt-2 text-sm text-slate-600">Join Nigeria's trusted local marketplace.</p>
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

            <form method="POST" action="{{ route('register.submit') }}" class="space-y-4">
                @csrf

                <div>
                    <label for="name" class="block text-sm font-medium text-slate-700">Full Name</label>
                    <input id="name" name="name" type="text" required
                           value="{{ old('name') }}"
                           class="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors">
                </div>

                <div>
                    <label for="email" class="block text-sm font-medium text-slate-700">Email</label>
                    <input id="email" name="email" type="email" required
                           value="{{ old('email') }}"
                           class="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors">
                </div>

                <div>
                    <label for="phone" class="block text-sm font-medium text-slate-700">Phone Number</label>
                    <input id="phone" name="phone" type="tel" required placeholder="+234 812 345 6789"
                           value="{{ old('phone') }}"
                           class="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors">
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-slate-700">Password</label>
                    <input id="password" name="password" type="password" required minlength="6"
                           class="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors">
                </div>

                <button type="submit"
                        class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-lg transition-colors">
                    Create Account
                </button>
            </form>

            <div class="mt-8 text-center">
                <p class="text-xs text-slate-500">Already have an account?</p>
                <a href="{{ route('login') }}" class="text-emerald-600 font-bold text-xs hover:underline">Sign In</a>
            </div>
        </div>
    </div>
</x-guest-layout>
