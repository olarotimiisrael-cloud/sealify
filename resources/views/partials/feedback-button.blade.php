{{-- Floating Feedback Button --}}
<div id="feedback-widget" class="fixed bottom-24 right-4 z-50">
    <button id="feedback-toggle" class="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center" title="Send Feedback">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
    </button>
    <div id="feedback-panel" class="hidden absolute bottom-16 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-5">
        <div class="flex items-center justify-between mb-3">
            <h4 class="font-bold text-slate-900">Send Feedback</h4>
            <button id="feedback-close" class="text-slate-400 hover:text-slate-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
        @auth
        <form method="POST" action="{{ route('feedback.store') }}">
            @csrf
            <input type="hidden" name="page_url" value="{{ url()->current() }}">
            <div class="mb-3">
                <select name="type" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                    <option value="general">General Feedback</option>
                    <option value="bug">Bug Report</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="complaint">Complaint</option>
                </select>
            </div>
            <div class="mb-3">
                <textarea name="message" rows="3" placeholder="Tell us what you think..." class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" required></textarea>
            </div>
            <button type="submit" class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl transition-colors text-sm">
                Submit Feedback
            </button>
        </form>
        @else
        <p class="text-sm text-slate-500 mb-3">Please log in to submit feedback.</p>
        <a href="{{ route('login') }}" class="block w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl transition-colors text-sm text-center">
            Log In
        </a>
        @endauth
    </div>
</div>

<script>
(function() {
    var toggle = document.getElementById('feedback-toggle');
    var panel = document.getElementById('feedback-panel');
    var close = document.getElementById('feedback-close');
    if (toggle && panel) {
        toggle.addEventListener('click', function() {
            panel.classList.toggle('hidden');
        });
    }
    if (close && panel) {
        close.addEventListener('click', function() {
            panel.classList.add('hidden');
        });
    }
    document.addEventListener('click', function(e) {
        if (panel && !panel.classList.contains('hidden') && !panel.contains(e.target) && !toggle.contains(e.target)) {
            panel.classList.add('hidden');
        }
    });
})();
</script>