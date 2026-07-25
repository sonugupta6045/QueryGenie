import { store } from '../store/store';
import { setSessionExpired, clearCredentials } from '../store/slices/authSlice';

// A single BroadcastChannel used by this tab
const sessionChannel = new BroadcastChannel('session');

// Listen for messages from other tabs
sessionChannel.onmessage = (event) => {
  if (event.data === 'session-expired') {
    // Another tab failed to refresh, mark this tab as expired
    store.dispatch(setSessionExpired(true));
  } else if (event.data === 'session-restored') {
    // Another tab successfully re-authenticated, close the prompt in this tab
    // Note: To truly restore, we'd need the new accessToken. 
    // In a real robust system, we might reload or trigger a silent refresh here.
    // For now, reloading ensures this tab gets the latest accessToken from a fresh refresh attempt
    // Or we could just clear the expired state and let the next API call fetch a fresh token.
    store.dispatch(setSessionExpired(false));
    
    // To ensure the new accessToken is picked up by Axios in this tab without a hard reload,
    // we can either broadcast the new token (less secure) or just trigger a silent background refresh.
    // Easiest robust fix: Just trigger a hard reload since they re-authenticated in another tab,
    // OR just let the next network request naturally trigger getNewToken().
    // We'll let the next network request trigger getNewToken(), which will succeed.
  }
};

export const broadcastSessionExpired = () => {
  sessionChannel.postMessage('session-expired');
};

export const broadcastSessionRestored = () => {
  sessionChannel.postMessage('session-restored');
};
