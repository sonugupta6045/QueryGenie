import { store } from '../store/store';
import { setSessionExpired } from '../store/slices/authSlice';

// A single BroadcastChannel used by this tab
const sessionChannel = new BroadcastChannel('session');

// Listen for messages from other tabs
sessionChannel.onmessage = (event) => {
  if (event.data === 'session-expired') {
    // Another tab failed to refresh, mark this tab as expired
    store.dispatch(setSessionExpired(true));
  } else if (event.data === 'session-restored') {
    // Another tab successfully re-authenticated, close the prompt in this tab
    store.dispatch(setSessionExpired(false));
    
    // Silently fetch the newly issued token for this tab
    import('./refreshQueue').then(({ getNewToken }) => {
      getNewToken().catch(() => {
        // Ignore errors, if it fails it will naturally dispatch session expired again
      });
    });
  }
};

export const broadcastSessionExpired = () => {
  sessionChannel.postMessage('session-expired');
};

export const broadcastSessionRestored = () => {
  sessionChannel.postMessage('session-restored');
};
