import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

(window as any).Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  wsHost: import.meta.env.VITE_PUSHER_HOST,
  wsPort: import.meta.env.VITE_PUSHER_PORT,
  wssPort: import.meta.env.VITE_PUSHER_PORT,
  forceTLS: (import.meta.env.VITE_PUSHER_SCHEME || 'http') === 'https',
  disabledStats: true,
  enabledTransports: ['ws', 'wss'],
});

export { echo };
