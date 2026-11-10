import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
    }
}

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,

    wsHost: '172.28.205.104',
    wsPort: 8080,
    wssPort: 8080,

    forceTLS: false,
    enabledTransports: ['ws'],
    disableStats: true,
});

echo.connector.pusher.connection.bind('state_change', (states: any) => {
    console.log('Reverb connection state:', states);
});

echo.connector.pusher.connection.bind('error', (error: any) => {
    console.error('Reverb connection error:', error);
});

export default echo;