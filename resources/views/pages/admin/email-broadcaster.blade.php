@extends('layouts.admin')

@section('adminContent')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-black text-slate-900 mb-2">Email Broadcaster</h1>
            <p class="text-slate-600">Send custom emails to all users or individual users.</p>
        </div>
        <a href="{{ route('admin.dashboard') }}" class="text-sm text-emerald-600 font-bold hover:underline">← Back to Dashboard</a>
    </div>

    <!-- Email Composer Card -->
    <div class="bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-50/30 p-8 sm:p-10">
        
        <!-- Send Mode Selector -->
        <div class="flex flex-col sm:flex-row gap-6 items-start sm:items-end mb-8">
            <div class="flex-1 max-w-md">
                <h3 class="text-lg font-bold text-slate-900 mb-4">Compose Email</h3>
                <form id="email-composer-form" class="space-y-6">
                    @csrf

                    <!-- Subject -->
                    <div>
                        <label for="subject" class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Email Subject</label>
                        <input name="subject" type="text" id="subject"
                               placeholder="Enter email subject..."
                               class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                    </div>

                    <!-- TinyMCE Rich Text Editor -->
                    <div>
                        <label for="content" class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Email Content</label>
                        <textarea name="content" id="tinymce-editor" rows="15"
                                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"></textarea>
                    </div>

                    <!-- Hidden actual content input for form submission -->
                    <input type="hidden" name="actual_content" id="actual-content-input">

                    <!-- Send Mode -->
                    <div class="border-t border-slate-100 pt-6">
                        <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-4">Send To</label>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label class="flex items-center gap-3 cursor-pointer group">
                                <input name="send_to" type="radio" value="all" class="w-4 h-4 text-emerald-600 rounded border-slate-200" checked>
                                <div>
                                    <p class="font-bold text-slate-900">All Users</p>
                                    <p class="text-xs text-slate-500">Send to every registered user</p>
                                </div>
                            </label>
                            <label class="flex items-center gap-3 cursor-pointer group">
                                <input name="send_to" type="radio" value="individual" id="send-to-individual" class="w-4 h-4 text-emerald-600 rounded border-slate-200">
                                <div>
                                    <p class="font-bold text-slate-900">Individual User</p>
                                    <p class="text-xs text-slate-500">Send to a specific user</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Individual User Select -->
                    <div id="individual-user-select" class="hidden mt-6 border-t border-slate-100 pt-6">
                        <div>
                            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Select User</label>
                            <select name="user_id" id="user-id-select"
                                    class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                                <option value="">-- Select a user --</option>
                                @foreach ($users as $user)
                                    <option value="{{ $user->id }}">{{ $user->name }} ({{ $user->email }})</option>
                                @endforeach
                            </select>
                        </div>
                    </div>

                    <!-- Send Button -->
                    <button type="submit" id="send-email-btn"
                            class="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-xl transition-colors shadow-lg shadow-emerald-200 hover:shadow-emerald-300 flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L4 8m4-4v12"></path></svg>
                        Send Email
                    </button>
                </form>
            </div>

            <!-- Preview Panel -->
            <div class="flex-1 max-w-2xl bg-slate-50 rounded-2xl border border-slate-200 p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-slate-900">Preview</h3>
                    <button id="refresh-preview" class="text-xs text-emerald-600 font-bold hover:underline">Refresh</button>
                </div>
                <div id="email-preview" class="bg-white rounded-xl border border-slate-200 p-6 min-h-[300px]">
                    <div class="text-slate-500 text-sm text-center mt-10">
                        Email preview will appear here...
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Users</p>
            <p class="text-2xl font-bold text-slate-900">{{ $users->count() }}</p>
        </div>
        <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Verified Emails</p>
            <p class="text-2xl font-bold text-emerald-600">{{ $users->whereNotNull('email_verified_at')->count() }}</p>
        </div>
        <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Active Users</p>
            <p class="text-2xl font-bold text-blue-600">{{ $users->where('status', 'active')->count() }}</p>
        </div>
    </div>
</div>

<!-- TinyMCE CDN -->
<script src="https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js" referrerpolicy="origin"></script>

<script>
tinymce.init({
    selector: '#tinymce-editor',
    height: 400,
    menubar: 'file edit view insert format tools help',
    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charcode | removeformat',
    plugins: 'advlist autolink lists link image charmap print preview anchor textcolor colorpicker textpattern visualblocks code fullscreen',
    content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #333; }',
    branding: false,
    automatic_uploads: true,
    images_upload_handler: function (blobInfo, success, failure, progress) {
        var xhr, formData;

        xhr = new XMLHttpRequest();
        xhr.withCredentials = false;
        xhr.open('POST', '/admin/email-broadcaster/upload-image');

        xhr.upload.onprogress = function (e) {
            progress(e.loaded / e.total * 100);
        };

        xhr.onload = function () {
            var json;

            if (xhr.status === 403) {
                failure('HTTP Error: ' + xhr.status);
                return;
            }

            if (xhr.status < 200 || xhr.status >= 300) {
                failure('HTTP Error: ' + xhr.status);
                return;
            }

            json = JSON.parse(xhr.responseText);

            if (!json || typeof json.location !== 'string') {
                failure('Invalid JSON: ' + xhr.responseText);
                return;
            }

            success(json.location);
        };

        xhr.onerror = function () {
            failure('Image upload failed due to a XHR Transport error. Code: ' + xhr.status);
        };

        formData = new FormData();
        formData.append('file', blobInfo.blob(), blobInfo.filename());

        xhr.send(formData);
    },
    setup: function (editor) {
        editor.on('change input keyup', function () {
            var content = editor.getContent();
            document.getElementById('actual-content-input').value = content;
            document.getElementById('email-preview').innerHTML = content;
        });
        editor.on('init', function () {
            document.getElementById('actual-content-input').value = editor.getContent();
        });
    }
});

document.getElementById('send-to-individual').addEventListener('change', function () {
    document.getElementById('individual-user-select').classList.remove('hidden');
});

document.querySelectorAll('input[name="send_to"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
        if (this.value === 'individual') {
            document.getElementById('individual-user-select').classList.remove('hidden');
        } else {
            document.getElementById('individual-user-select').classList.add('hidden');
        }
    });
});

document.getElementById('refresh-preview').addEventListener('click', function () {
    var editor = tinymce.get('tinymce-editor');
    if (editor) {
        document.getElementById('email-preview').innerHTML = editor.getContent();
    }
});

document.getElementById('email-composer-form').addEventListener('submit', function (e) {
    var btn = document.getElementById('send-email-btn');
    btn.disabled = true;
    btn.innerHTML = '<svg class="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l-2.647 2.647a.5.5 0 01-.708-.708L3.057 13H4c1.257 0 2.343-.904 2.674-2.196A7.962 7.962 0 0112 4a7.962 7.962 0 017.938 7c0 2.373-.905 4.36-2.374 5.878l-2.647 2.647a.5.5 0 01-.708-.708L11.943 13H14c.373 0 .741-.042 1.09-.305A7.98 7.98 0 0022 12c0-2.072-.797-3.94-2.196-5.392z"></path></svg> Sending...';
});
</script>
@endsection
