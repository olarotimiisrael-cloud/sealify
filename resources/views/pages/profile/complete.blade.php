<x-guest-layout>
    <x-form-card title="Complete Your Profile" subtitle="Add your name and phone number to finish setup.">
        <div class="flex items-center justify-center mb-6">
            @include('partials.sealify-logo', ['size' => 'xl', 'class' => ''])
        </div>

        <form method="POST" action="{{ route('profile.complete.submit') }}" class="space-y-4">
            @csrf

            <div>
                <label for="full_name" class="block text-sm font-medium text-slate-700">Full Name</label>
                <input id="full_name" name="full_name" type="text" required
                       class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
            </div>

            <div>
                <label for="phone_number" class="block text-sm font-medium text-slate-700">Phone Number</label>
                <input id="phone_number" name="phone_number" type="tel" required placeholder="+234 812 345 6789"
                       class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
            </div>

            <button type="submit"
                    class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                Complete Profile
            </button>
        </form>
    </x-form-card>
</x-guest-layout>
