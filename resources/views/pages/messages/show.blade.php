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
                <div class="flex-1 relative">
                    <input name="body" type="text" placeholder="Type a message..." id="message-text-input"
                           class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 pl-14 pr-20">
                    <div class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <button type="button" onclick="toggleEmojiPicker()" class="p-1 hover:text-emerald-600 transition-colors" title="Emoji">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </button>
                    </div>
                    <div class="absolute right-3 top-1/2 -translate-y-1/2">
                        <button type="button" id="emoji-toggle-btn" onclick="toggleEmojiPicker()" class="p-1 hover:text-emerald-600 transition-colors" title="Emoji">
                            <span class="text-lg">😊</span>
                        </button>
                    </div>
                    <div id="emoji-picker" class="hidden absolute bottom-12 right-0 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-4 z-50 grid grid-cols-8 gap-1 text-xl">
                        <button type="button" onclick="insertEmoji('😊')" class="p-1 hover:bg-slate-100 rounded">😊</button>
                        <button type="button" onclick="insertEmoji('❤️')" class="p-1 hover:bg-slate-100 rounded">❤️</button>
                        <button type="button" onclick="insertEmoji('👍')" class="p-1 hover:bg-slate-100 rounded">👍</button>
                        <button type="button" onclick="insertEmoji('😂')" class="p-1 hover:bg-slate-100 rounded">😂</button>
                        <button type="button" onclick="insertEmoji('🎉')" class="p-1 hover:bg-slate-100 rounded">🎉</button>
                        <button type="button" onclick="insertEmoji('🔥')" class="p-1 hover:bg-slate-100 rounded">🔥</button>
                        <button type="button" onclick="insertEmoji('💯')" class="p-1 hover:bg-slate-100 rounded">💯</button>
                        <button type="button" onclick="insertEmoji('🤔')" class="p-1 hover:bg-slate-100 rounded">🤔</button>
                        <button type="button" onclick="insertEmoji('😍')" class="p-1 hover:bg-slate-100 rounded">😍</button>
                        <button type="button" onclick="insertEmoji('😎')" class="p-1 hover:bg-slate-100 rounded">😎</button>
                        <button type="button" onclick="insertEmoji('🙏')" class="p-1 hover:bg-slate-100 rounded">🙏</button>
                        <button type="button" onclick="insertEmoji('👌')" class="p-1 hover:bg-slate-100 rounded">👌</button>
                        <button type="button" onclick="insertEmoji('👋')" class="p-1 hover:bg-slate-100 rounded">👋</button>
                        <button type="button" onclick="insertEmoji('💪')" class="p-1 hover:bg-slate-100 rounded">💪</button>
                        <button type="button" onclick="insertEmoji('✅')" class="p-1 hover:bg-slate-100 rounded">✅</button>
                        <button type="button" onclick="insertEmoji('❌')" class="p-1 hover:bg-slate-100 rounded">❌</button>
                        <button type="button" onclick="insertEmoji('⭐')" class="p-1 hover:bg-slate-100 rounded">⭐</button>
                        <button type="button" onclick="insertEmoji('📦')" class="p-1 hover:bg-slate-100 rounded">📦</button>
                        <button type="button" onclick="insertEmoji('🚚')" class="p-1 hover:bg-slate-100 rounded">🚚</button>
                        <button type="button" onclick="insertEmoji('💰')" class="p-1 hover:bg-slate-100 rounded">💰</button>
                        <button type="button" onclick="insertEmoji('🏠')" class="p-1 hover:bg-slate-100 rounded">🏠</button>
                        <button type="button" onclick="insertEmoji('📱')" class="p-1 hover:bg-slate-100 rounded">📱</button>
                        <button type="button" onclick="insertEmoji('💻')" class="p-1 hover:bg-slate-100 rounded">💻</button>
                        <button type="button" onclick="insertEmoji('🚗')" class="p-1 hover:bg-slate-100 rounded">🚗</button>
                        <button type="button" onclick="insertEmoji('✅')" class="p-1 hover:bg-slate-100 rounded">✅</button>
                    </div>
                </div>

                <label for="media-input" class="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer" title="Attach media">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <input type="file" id="media-input" name="attachments[]" accept="image/*,audio/*,video/*" class="hidden" multiple>
                </label>

                <button type="submit" id="send-btn" class="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-emerald-200 hover:shadow-emerald-300 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-4-4m0 0l-4-4m4 4V4"></path></svg>
                    Send
                </button>
            </form>
            <div class="mt-3 flex items-center gap-3">
                <button id="voice-record-btn" type="button" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-medium transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-14 0m7 7v4m-4 0h8M12 3a3 3 0 00-3 3v5a3 3 0 006 0V6a3 3 0 00-3-3z"/></svg>
                    <span id="voice-record-label">Record Voice Note</span>
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
    const servers = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun.cloudflare.com:3478' },
        ],
    };
    pc = new RTCPeerConnection(servers);

    pc.ontrack = event => {
        const remoteStream = event.streams[0];
        const remoteVideo = document.getElementById('remote-video');
        if (remoteVideo) {
            remoteVideo.srcObject = remoteStream;
        }
        // Update status to connected
        const statusEl = document.getElementById('call-status');
        if (statusEl) statusEl.textContent = 'Connected';
    };

    pc.onicecandidate = event => {
        if (event.candidate) {
            sendSignaling({ type: 'ice-candidate', candidate: event.candidate });
        }
    };

    pc.oniceconnectionstatechange = () => {
        const statusEl = document.getElementById('call-status');
        if (!statusEl) return;
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
            statusEl.textContent = 'Connected';
        } else if (pc.iceConnectionState === 'disconnected') {
            statusEl.textContent = 'Reconnecting…';
        } else if (pc.iceConnectionState === 'failed') {
            statusEl.textContent = 'Connection failed';
        }
    };

    if (localStream) {
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }

    signalingChannel = setInterval(async () => {
        try {
            const r = await fetch(`{{ route('messages.signaling.poll', $conversation) }}?since=${Date.now() - 30000}`, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            const data = await r.json();
            if (data.success && data.signals && data.signals.length) {
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
    if (!confirm('Start ' + (type === 'voice' ? 'voice' : 'video') + ' call with this user?')) return;

    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: type === 'video',
            audio: true
        });

        const localVideoEl = document.getElementById('local-video');
        if (localVideoEl && type === 'video') {
            localVideoEl.srcObject = localStream;
            localVideoEl.style.display = '';
        } else if (localVideoEl) {
            localVideoEl.style.display = 'none';
        }

        if (!callInProgress) {
            await initWebRTC();
            callInProgress = true;
        }

        // Always create and send an offer for the first caller
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignaling({ type: 'offer', payload: { sdp: pc.localDescription.sdp, callType: type } });

        showCallModal(true, type);
    } catch (err) {
        console.error('WebRTC error:', err);
        alert('Failed to access ' + (type === 'video' ? 'camera/microphone' : 'microphone') + ': ' + err.message);
    }
}

function showCallModal(show, type) {
    const modal = document.getElementById('call-modal');
    if (!modal) return;
    modal.classList.toggle('hidden', !show);

    if (show) {
        document.getElementById('call-title').textContent = type === 'voice' ? 'Voice Call' : 'Video Call';
        document.getElementById('call-status').textContent = 'Connecting…';
        // Hide video element for voice calls
        const remoteVideo = document.getElementById('remote-video');
        if (remoteVideo && type === 'voice') {
            remoteVideo.style.display = 'none';
        }
        startTimer();
    } else {
        const remoteVideo = document.getElementById('remote-video');
        if (remoteVideo) {
            remoteVideo.style.display = '';
        }
        stopTimer();
    }
}

let callTimerInterval = null;
let callSeconds = 0;

function startTimer() {
    stopTimer();
    callSeconds = 0;
    const timerEl = document.getElementById('call-timer');
    if (timerEl) timerEl.textContent = '00:00';
    callTimerInterval = setInterval(() => {
        callSeconds++;
        const m = String(Math.floor(callSeconds / 60)).padStart(2, '0');
        const s = String(callSeconds % 60).padStart(2, '0');
        if (timerEl) timerEl.textContent = `${m}:${s}`;
    }, 1000);
}

function stopTimer() {
    if (callTimerInterval) {
        clearInterval(callTimerInterval);
        callTimerInterval = null;
    }
}

function hangUp() {
    callInProgress = false;
    stopTimer();
    if (pc) {
        pc.close();
        pc = null;
    }
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    if (signalingChannel) {
        clearInterval(signalingChannel);
        signalingChannel = null;
    }
    showCallModal(false);
    // No alert — silent cleanup
}

// Listen for incoming call signals (poll detects offer/answer)
function handleIncomingCall() {
    // Poll is already running; incoming offer handled in handleRemoteSignal
}

// Improve ICE candidate handling — buffer until remote description is set
let pendingIceCandidates = [];

function handleRemoteSignal(signal) {
    const data = signal.payload || {};
    if (signal.type === 'offer') {
        const callType = data.callType || 'video';
        // Incoming call — ask user to accept or decline
        if (!callInProgress) {
            const callTypeLabel = callType === 'voice' ? 'Voice' : 'Video';
            if (confirm(`Incoming ${callTypeLabel.toLowerCase()} call. Accept?`)) {
                // User accepted — set up call and send answer
                acceptIncomingCall(callType).then(() => {
                    pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: data.sdp }))
                        .then(() => pc.createAnswer())
                        .then(answer => pc.setLocalDescription(answer))
                        .then(() => {
                            sendSignaling({ type: 'answer', payload: { sdp: pc.localDescription.sdp } });
                            pendingIceCandidates.forEach(c => pc.addIceCandidate(c).catch(() => {}));
                            pendingIceCandidates = [];
                        })
                        .catch(err => console.error('Handle offer error:', err));
                });
            } else {
                // User declined — send hangup signal
                sendSignaling({ type: 'hangup', payload: {} });
            }
            return;
        }
        // Already in a call — handle the offer
        pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: data.sdp }))
            .then(() => pc.createAnswer())
            .then(answer => pc.setLocalDescription(answer))
            .then(() => {
                sendSignaling({ type: 'answer', payload: { sdp: pc.localDescription.sdp } });
                pendingIceCandidates.forEach(c => pc.addIceCandidate(c).catch(() => {}));
                pendingIceCandidates = [];
            })
            .catch(err => console.error('Handle offer error:', err));
    } else if (signal.type === 'answer') {
        if (!pc) return;
        pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: data.sdp }))
            .then(() => {
                pendingIceCandidates.forEach(c => pc.addIceCandidate(c).catch(() => {}));
                pendingIceCandidates = [];
            })
            .catch(err => console.error('Handle answer error:', err));
    } else if (signal.type === 'ice-candidate') {
        if (pc && pc.remoteDescription) {
            pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(e => console.error('ICE error:', e));
        } else {
            pendingIceCandidates.push(new RTCIceCandidate(data.candidate));
        }
    } else if (signal.type === 'hangup') {
        hangUp();
    }
}

async function acceptIncomingCall(type) {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: type === 'video',
            audio: true
        });
        const localVideoEl = document.getElementById('local-video');
        if (localVideoEl && type === 'video') {
            localVideoEl.srcObject = localStream;
            localVideoEl.style.display = '';
        } else if (localVideoEl) {
            localVideoEl.style.display = 'none';
        }
        await initWebRTC();
        callInProgress = true;
        showCallModal(true, type);
    } catch (err) {
        console.error('Accept call error:', err);
        alert('Failed to accept call: ' + err.message);
    }
}

/* --- Media attachment upload (image/voice/video) --- */
function handleMediaUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let file of files) {
        formData.append('attachments[]', file);
    }

    const firstFile = files[0];
    let type = 'image';
    if (firstFile.type.startsWith('audio/')) type = 'voice';
    if (firstFile.type.startsWith('video/')) type = 'video';

    const btn = document.getElementById('send-btn');
    btn.disabled = true;
    const orig = btn.innerHTML;
    btn.innerHTML = '<svg class="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l-2.647 2.647a.5.5 0 01-.708-.708L3.057 13H4c1.257 0 2.343-.904 2.674-2.196A7.962 7.962 0 0112 4a7.962 7.962 0 017.938 7c0 2.373-.905 4.36-2.374 5.878l-2.647 2.647a.5.5 0 01-.708-.708L11.943 13H14c.373 0 .741-.042 1.09-.305A7.98 7.98 0 0022 12c0-2.072-.797-3.94-2.196-5.392z"></path></svg> Uploading...';

    fetch('{{ route('messages.store', $conversation) }}', {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || document.querySelector('input[name="_token"]')?.value,
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json',
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success || data.data || data) {
            location.reload();
        } else {
            throw new Error(data.message || 'Upload failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Upload failed: ' + error.message);
        btn.disabled = false;
        btn.innerHTML = orig;
    });

    // Reset file input so same file can be re-selected
    e.target.value = '';
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
    formData.append('attachments[]', file);

    const btn = document.getElementById('send-btn');
    btn.disabled = true;
    const orig = btn.innerHTML;
    btn.innerHTML = 'Sending…';

    try {
        const response = await fetch('{{ route('messages.store', $conversation) }}', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || document.querySelector('input[name="_token"]')?.value,
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
            },
            body: formData
        });
        const data = await response.json();
        if (data.success || data.data || response.ok) {
            location.reload();
        } else {
            throw new Error(data.message || 'Voice upload failed');
        }
    } catch (error) {
        console.error('Voice upload error:', error);
        alert('Voice upload failed: ' + error.message);
        btn.disabled = false;
        btn.innerHTML = orig;
    }
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

/* --- Message form submit (AJAX) --- */
document.getElementById('message-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const form = e.target;
    const textInput = document.getElementById('message-text-input');
    const mediaInput = document.getElementById('media-input');
    const sendBtn = document.getElementById('send-btn');
    const body = textInput.value.trim();

    if (!body && (!mediaInput.files || mediaInput.files.length === 0)) {
        return;
    }

    sendBtn.disabled = true;
    const originalBtnHtml = sendBtn.innerHTML;
    sendBtn.innerHTML = '<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l-2.647 2.647a.5.5 0 01-.708-.708L3.057 13H4c1.257 0 2.343-.904 2.674-2.196A7.962 7.962 0 0112 4a7.962 7.962 0 017.938 7c0 2.373-.905 4.36-2.374 5.878l-2.647 2.647a.5.5 0 01-.708-.708L11.943 13H14c.373 0 .741-.042 1.09-.305A7.98 7.98 0 0022 12c0-2.072-.797-3.94-2.196-5.392z"></path></svg> Sending...';

    try {
        const formData = new FormData();
        if (body) formData.append('body', body);
        if (mediaInput.files && mediaInput.files.length > 0) {
            for (let file of mediaInput.files) {
                formData.append('attachments[]', file);
            }
        }

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || document.querySelector('input[name="_token"]')?.value;

        const response = await fetch('{{ route('messages.store', $conversation) }}', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
            },
            body: formData
        });

        const data = await response.json();

        if (data.success || data.data || response.ok) {
            // Reload to show the new message
            location.reload();
        } else {
            throw new Error(data.message || 'Failed to send message');
        }
    } catch (error) {
        console.error('Send error:', error);
        alert('Failed to send message: ' + error.message);
        sendBtn.disabled = false;
        sendBtn.innerHTML = originalBtnHtml;
    }
});

/* --- Emoji picker --- */
function toggleEmojiPicker() {
    const picker = document.getElementById('emoji-picker');
    if (picker) {
        picker.classList.toggle('hidden');
    }
}

function insertEmoji(emoji) {
    const input = document.getElementById('message-text-input');
    if (input) {
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const value = input.value;
        input.value = value.substring(0, start) + emoji + value.substring(end);
        input.focus();
        input.setSelectionRange(start + emoji.length, start + emoji.length);
        // Close picker after insert
        document.getElementById('emoji-picker')?.classList.add('hidden');
    }
}

// Close emoji picker when clicking outside
document.addEventListener('click', function(e) {
    const picker = document.getElementById('emoji-picker');
    if (picker && !picker.contains(e.target) && !e.target.closest('button[title="Emoji"]') && !e.target.closest('#emoji-toggle-btn')) {
        picker.classList.add('hidden');
    }
});
</script>
@endsection
