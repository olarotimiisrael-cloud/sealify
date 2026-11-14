<x-guest-layout>
    <div class="max-w-md mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-8">
            <div class="text-center mb-8">
                <div class="flex items-center justify-center gap-2">
                    <img src="{{ asset('logo.png') }}" alt="Sealify" class="h-8 w-auto">
                    <span class="text-emerald-600 font-black text-xl tracking-tight">Sealify</span>
                </div>
                <h2 class="mt-4 text-2xl font-bold text-slate-900">Complete Your Profile</h2>
                <p class="mt-2 text-sm text-slate-600">Add your name and phone number to finish setup.</p>
            </div>

            <form method="POST" action="{{ route('profile.complete.submit') }}" class="space-y-4">
                @csrf

                <div>
                    <label for="full_name" class="block text-sm font-medium text-slate-700">Full Name</label>
                    <input id="full_name" name="full_name" type="text" required
                           class="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                </div>

                <div>
                    <label for="phone_number" class="block text-sm font-medium text-slate-700">Phone Number</label>
                    <input id="phone_number" name="phone_number" type="tel" required placeholder="+234 812 345 6789"
                           class="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                </div>

                <button type="submit"
                        class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-lg transition-colors">
                    Complete Profile
                </button>
            </form>
        </div>
    </div>
</x-guest-layout>

