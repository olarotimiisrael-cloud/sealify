@extends('layouts.app')

@section('content')
<?php
$isAdmin = auth()->user()->isAdmin();
$badgeColor = $conversation->other_user['badge'] ? $conversation->other_user['badge'] : null;
$badgeLabel = $conversation->other_user['badge_label'] ?? null;
$partnerBadgeHtml = '';
if ($badgeColor && $badgeLabel) {
    $partnerBadgeHtml = '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-' . $badgeColor . '-100 text-' . $badgeColor . '-700">' . $badgeLabel . '</span>';
}
?>
<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                    {{ strtoupper(substr($conversation->other_user['name'] ?? 'U', 0, 1)) }}
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <p class="text-sm font-bold text-slate-900">{{ $conversation->other_user['name'] ?? 'User' }}</p>
                        {!! $partnerBadgeHtml !!}
                    </div>
                    <p class="text-xs text-slate-500">{{ $conversation->listingTitle ?? 'Listing conversation' }}</p>
                </div>
                <div class="flex items-center gap-3">
                    <button onclick="startVideoCall('video')" class="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-emerald-200 hover:shadow-emerald-300 flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        Video Call
                    </button>
                    <button onclick="startVideoCall('voice')" class="px-3 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-200 hover:shadow-blue-300 flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.336 14.66c-1.142.628-1.875 1.927-1.875 3.3v.264c0 1.376.737 2.667 1.875 3.34 1.142-.673 1.875-1.964 1.875-3.34v-.264c0-1.376-.737-2.667-1.875-3.3zM12.5 10c.655-.795.982-1.76.982-2.85S13.155 4.3 12.5 3.5c-.655.795-.982 1.76-.982 2.85 0 1.09.327 2.055.982 2.85z"></path></svg>
                        Voice Call
                    </button>
                </div>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" id="message-container">
            @if ($conversation->messages->isEmpty())
                <div class="text-center pt-20">
                    <div class="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4 text-4xl">💬</div>
                    <h3 class="text-lg font-bold text-slate-900 mb-2">Start the Conversation</h3>
                    <p class="text-slate-600 mb-6">Send a message, share an image, voice note, or start a video call.</p>
                    <button onclick="document.getElementById('file-input').click()" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2 rounded-xl transition-colors">
                        📷 Share Media
                    </button>
                    <input type="file" id="file-input" accept="image/*,audio/*,video/*" class="hidden" multiple>
                </div>
            @else
                @foreach ($conversation->messages as $message)
                    <?php
                    $isSender = $message->sender_id == auth()->id();
                    $bgClass = $isSender ? 'bg-emerald-500 text-white' : 'bg-white text-slate-900 border border-slate-200';
                    $radiusClass = $isSender ? 'rounded-tr-none' : 'rounded-tl-none';
                    $justify = $isSender ? 'justify-end' : 'justify-start';
                    $align = $isSender ? 'text-right' : 'text-left';
                    $badgeHtml = '';
                    if ($message->sender->hasBadge()) {
                        $badgeHtml = '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-' . $message->sender->badgeColor() . '-100 text-' . $message->sender->badgeColor() . '-700 mb-1">' . $message->sender->badgeLabel() . '</span>';
                    }
                    ?>
                    <div class="flex {{ $justify }} mb-2">
                        <div class="max-w-[85%] {{ $bgClass }} rounded-2xl {{ $radiusClass }} p-3 shadow-sm group relative">
                            {!! $badgeHtml !!}
                            @if ($message->isImage() || $message->isVideo())
                                <div class="relative aspect-video rounded-xl overflow-hidden mb-2 border border-slate-200">
                                    <img src="{{ $message->attachments->first()?->url }}" alt="Media" class="w-full h-full object-cover cursor-pointer group-hover:opacity-90 transition-opacity">
                                    @if ($message->isVideo())
                                        <span class="absolute bottom-2 right-2 bg-black/50 text-white text-xs rounded px-2 py-1">🎥 Video</span>
                                    @endif
                                </div>
                            @elseif ($message->isVoice())
                                <div class="bg-slate-100 rounded-xl p-3 mb-2 border border-slate-200">
                                    <div class="flex items-center gap-3">
                                        <span class="text-emerald-600 animate-pulse">●</span>
                                        <audio controls class="w-full">
                                            <source src="{{ $message->attachments->first()?->url }}" type="{{ $message->attachments->first()?->mime_type }}">
                                            Your browser does not support the audio element.
                                        </audio>
                                        <span class="text-xs text-slate-500 font-mono">{{ \Carbon\Carbon::parse($message->created_at)->format('g:i a') }}</span>
                                    </div>
                                </div>
                            @else
                                <p class="text-sm {{ $isSender ? 'text-white' : 'text-slate-900' }}">{{ $message->body }}</p>
                                <p class="text-[10px] {{ $isSender ? 'text-emerald-200' : 'text-slate-400' }} mt-1 {{ $align }}">
                                    {{ \Carbon\Carbon::parse($message->created_at)->format('g:i a') }}
                                </p>
                            @endif
                        </div>
                    </div>
                @endforeach
            @endif
        </div>

        <div class="border-t border-slate-100 p-4 bg-white">
            <form id="message-form" enctype="multipart/form-data" class="flex gap-3 items-end">
                @csrf
                <input type="hidden" name="content" value="">
                <div class="flex-1 relative">
                    <input name="message_text" type="text" placeholder="Type a message..." id="message-text-input"
                           class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 pl-14">
                    <div class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                </div>

                <label for="media-input" class="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-emerald-600 transition-colors" title="Attach media">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <input type="file" id="media-input" accept="image/*,audio/*,video/*" class="hidden" multiple>
                </label>

                <button type="submit" id="send-btn" class="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-emerald-200 hover:shadow-emerald-300 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-4-4m0 0l-4-4m4 4V4"></path></svg>
                    Send
                </button>
            </form>
            <div class="mt-3 flex items-center gap-3">
                <button id="voice-record-btn" type="button" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-medium transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-14 0m7 7v4m-4 0h8M12 3a3 3 0 00-3 3v5a3 3 0 006 0V6a3 3 0 00-3-3z"/></svg>
                    <span id="voice-record-label">Record</span>
                </button>
                <span id="voice-record-status" class="text-xs text-slate-500 hidden">Recording…</span>
            </div>
        </div>
    </div>
</div>

<!-- CALL MODAL -->
<div id="call-modal" class="hidden fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-4xl">
        <div class="flex items-center justify-between mb-4 text-white">
            <div>
                <p id="call-title" class="font-bold text-lg">Call</p>
                <p id="call-status" class="text-sm text-slate-300">Connecting…</p>
            </div>
            <div id="call-timer" class="text-sm font-mono text-emerald-300">00:00</div>
        </div>
        <div class="relative rounded-2xl overflow-hidden bg-slate-800 aspect-video">
            <video id="remote-video" autoplay playsinline class="w-full h-full object-cover bg-black"></video>
            <video id="local-video" autoplay playsinline muted class="absolute bottom-4 right-4 w-32 sm:w-44 rounded-xl border-2 border-white shadow-lg object-cover bg-black aspect-video"></video>
        </div>
        <div class="flex items-center justify-center gap-4 mt-6">
            <button id="toggle-mic" type="button" class="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-colors" title="Toggle microphone">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-14 0m7 7v4m-4 0h8M12 3a3 3 0 00-3 3v5a3 3 0 006 0V6a3 3 0 00-3-3z"/></svg>
            </button>
            <button id="end-call" type="button" class="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition-colors" title="End call">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8l-4 4m0 0l-4-4m4 4V3"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12a9 9 0 0118 0"/></svg>
            </button>
            <button id="toggle-cam" type="button" class="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-colors" title="Toggle camera">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            </button>
        </div>
    </div>
</div>

<script>
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('install-app-btn').classList.remove('hidden');
});

/* --- WebRTC Video Call with Signaling --- */

let pc;
let localStream;
let signalingChannel = null;
let callInProgress = false;

async function initWebRTC() {
    const servers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    pc = new RTCPeerConnection(servers);

    pc.ontrack = event => {
        const remoteStream = event.streams[0];
        document.getElementById('remote-video').srcObject = remoteStream;
    };

    pc.onicecandidate = event => {
        if (event.candidate) {
            sendSignaling({ type: 'ice-candidate', candidate: event.candidate });
        }
    };

    if (localStream) {
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }

    signalingChannel = setInterval(async () => {
        try {
            const r = await fetch(`{{ route('messages.signaling.poll', $conversation) }}?since=${Date.now()}`, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            const data = await r.json();
            if (data.success && data.signals.length) {
                data.signals.forEach(s => handleRemoteSignal(s));
            }
        } catch (err) {
            console.error('Signaling poll error:', err);
        }
    }, 2000);
}

async function handleRemoteSignal(signal) {
    const data = signal.payload;
    if (signal.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: data.sdp }));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignaling({ type: 'answer', payload: { sdp: pc.localDescription.sdp } });
    } else if (signal.type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: data.sdp }));
    } else if (signal.type === 'ice-candidate') {
        try {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
            console.error('ICE candidate error:', e);
        }
    }
}

async function sendSignaling(message) {
    await fetch(`{{ route('messages.signaling.store', $conversation) }}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(message)
    });
}

async function startVideoCall(type) {
    if (!confirm('Start ' + type + ' call with this user?')) return;

    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: type === 'video',
            audio: true
        });

        document.getElementById('local-video').srcObject = localStream;

        if (!callInProgress) {
            await initWebRTC();
            callInProgress = true;
        }

        if (type === 'video') {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            sendSignaling({ type: 'offer', payload: { sdp: pc.localDescription.sdp } });
        }

        showCallModal(true);
    } catch (err) {
        console.error('WebRTC error:', err);
        alert('Failed to access camera/microphone: ' + err.message);
    }
}

function showCallModal(show) {
    const modal = document.getElementById('call-modal');
    modal.classList.toggle('hidden', !show);
    modal.classList.toggle('block', show);

    if (show) {
        document.getElementById('call-title').textContent = 'Video Call';
        document.getElementById('call-status').textContent = 'Connecting…';
        startTimer();
    }
}

function startTimer() {
    const timerEl = document.getElementById('call-timer');
    let seconds = 0;
    setInterval(() => {
        seconds++;
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        timerEl.textContent = `${m}:${s}`;
    }, 1000);
}

function hangUp() {
    callInProgress = false;
    if (pc) {
        pc.close();
        pc = null;
    }
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    if (signalingChannel) {
        clearInterval(signalingChannel);
        signalingChannel = null;
    }
    showCallModal(false);
    alert('Call ended.');
}

document.getElementById('end-call').addEventListener('click', hangUp);
document.getElementById('toggle-mic').addEventListener('click', () => {
    const btn = document.getElementById('toggle-mic');
    const muted = btn.getAttribute('data-muted') === 'true';
    if (localStream) {
        localStream.getAudioTracks().forEach(track => track.enabled = !muted);
    }
    btn.setAttribute('data-muted', String(!muted));
    btn.innerHTML = !muted
        ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-14 0m7 7v4m-4 0h8M12 3a3 3 0 00-3 3v5a3 3 0 006 0V6a3 3 0 00-3-3z"/></svg>'
        : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8l-4 4m0 0l-4-4m4 4V3"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12a9 9 0 0118 0"/></svg>';
});

document.getElementById('toggle-cam').addEventListener('click', () => {
    const btn = document.getElementById('toggle-cam');
    const off = btn.getAttribute('data-off') === 'true';
    if (localStream) {
        localStream.getVideoTracks().forEach(track => track.enabled = !off);
    }
    btn.setAttribute('data-off', String(!off));
    btn.innerHTML = !off
        ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>'
        : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>';
});

/* --- Media attachment upload (image/voice/video) --- */
function handleMediaUpload(e) {
    const files = e.target.files;
    if (files.length === 0) return;

    const formData = new FormData();
    for (let file of files) {
        formData.append('file', file);
    }

    const firstFile = files[0];
    let type = 'image';
    if (firstFile.type.startsWith('audio/')) type = 'voice';
    if (firstFile.type.startsWith('video/')) type = 'video';
    formData.append('type', type);

    const btn = document.getElementById('send-btn');
    btn.disabled = true;
    btn.innerHTML = '<svg class="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l-2.647 2.647a.5.5 0 01-.708-.708L3.057 13H4c1.257 0 2.343-.904 2.674-2.196A7.962 7.962 0 0112 4a7.962 7.962 0 017.938 7c0 2.373-.905 4.36-2.374 5.878l-2.647 2.647a.5.5 0 01-.708-.708L11.943 13H14c.373 0 .741-.042 1.09-.305A7.98 7.98 0 0022 12c0-2.072-.797-3.94-2.196-5.392z"></path></svg> Uploading...';

    fetch('{{ route('messages.attachments.store', $conversation) }}', {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            alert('Upload failed.');
            btn.disabled = false;
            btn.innerHTML = 'Send';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Upload failed.');
        btn.disabled = false;
        btn.innerHTML = 'Send';
    });
}

document.getElementById('media-input').addEventListener('change', handleMediaUpload);
const fileInputEl = document.getElementById('file-input');
if (fileInputEl) fileInputEl.addEventListener('change', handleMediaUpload);

/* --- Voice note recording with MediaRecorder --- */
let voiceRecorder = null;
let voiceChunks = [];
let voiceRecording = false;

async function uploadVoiceBlob(blob) {
    const file = new File([blob], 'voice-note.webm', { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'voice');

    const btn = document.getElementById('send-btn');
    btn.disabled = true;
    btn.innerHTML = 'Sending…';

    await fetch('{{ route('messages.attachments.store', $conversation) }}', {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            alert('Voice upload failed.');
            btn.disabled = false;
            btn.innerHTML = 'Send';
        }
    })
    .catch(error => {
        console.error('Voice upload error:', error);
        alert('Voice upload failed.');
        btn.disabled = false;
        btn.innerHTML = 'Send';
    });
}

const voiceRecordBtn = document.getElementById('voice-record-btn');
const voiceRecordStatus = document.getElementById('voice-record-status');
const voiceRecordLabel = document.getElementById('voice-record-label');

voiceRecordBtn.addEventListener('click', async () => {
    if (!voiceRecording) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            voiceRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            voiceChunks = [];
            voiceRecorder.ondataavailable = e => { if (e.data.size) voiceChunks.push(e.data); };
            voiceRecorder.onstop = () => {
                stream.getTracks().forEach(track => track.stop());
                const blob = new Blob(voiceChunks, { type: 'audio/webm' });
                uploadVoiceBlob(blob);
            };
            voiceRecorder.start();
            voiceRecording = true;
            voiceRecordBtn.classList.replace('bg-blue-500', 'bg-rose-500');
            voiceRecordBtn.classList.replace('hover:bg-blue-400', 'hover:bg-rose-400');
            voiceRecordLabel.textContent = 'Stop';
            voiceRecordStatus.classList.remove('hidden');
        } catch (err) {
            console.error('Voice record error:', err);
            alert('Microphone access denied.');
        }
    } else {
        voiceRecorder.stop();
        voiceRecording = false;
        voiceRecordBtn.classList.replace('bg-rose-500', 'bg-blue-500');
        voiceRecordBtn.classList.replace('hover:bg-rose-400', 'hover:bg-blue-400');
        voiceRecordLabel.textContent = 'Record';
        voiceRecordStatus.classList.add('hidden');
    }
});

/* --- Message form submit --- */
document.getElementById('message-form').addEventListener('submit', function(e) {
    const textInput = document.getElementById('message-text-input');
    const contentInput = document.querySelector('input[name="content"]');
    if (textInput.value.trim()) {
        contentInput.value = textInput.value;
        return true;
    }
    e.preventDefault();
});
</script>
@endsection
