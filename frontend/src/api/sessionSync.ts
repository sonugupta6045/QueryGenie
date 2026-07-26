import { store } from '../store/store';
import { setAccessToken, setSessionExpired } from '../store/slices/authSlice';

export type SessionEventType = 'TOKEN_REFRESHED' | 'SESSION_EXPIRED' | 'SESSION_RESTORED';

export interface SessionSyncPayload {
  type: SessionEventType;
  accessToken?: string;
  expiresAtMs?: number;
  timestamp: number;
}

const CHANNEL_NAME = 'querygenie-session';

let channel: BroadcastChannel | null = null;
let lastReceivedToken: string | null = null;
let lastReceivedTime: number = 0;

export function initSessionSync() {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    return;
  }

  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    
    channel.onmessage = (event: MessageEvent<SessionSyncPayload>) => {
      const { type, accessToken, timestamp } = event.data;

      if (type === 'TOKEN_REFRESHED' && accessToken) {
        lastReceivedToken = accessToken;
        lastReceivedTime = timestamp;
        store.dispatch(setAccessToken(accessToken));
      } else if (type === 'SESSION_EXPIRED') {
        store.dispatch(setSessionExpired(true));
      } else if (type === 'SESSION_RESTORED' && accessToken) {
        lastReceivedToken = accessToken;
        lastReceivedTime = timestamp;
        store.dispatch(setAccessToken(accessToken));
      }
    };
  }
}

export function broadcastTokenRefreshed(accessToken: string, expiresAtMs?: number) {
  const payload: SessionSyncPayload = {
    type: 'TOKEN_REFRESHED',
    accessToken,
    expiresAtMs,
    timestamp: Date.now(),
  };
  lastReceivedToken = accessToken;
  lastReceivedTime = payload.timestamp;
  channel?.postMessage(payload);
}

export function broadcastSessionExpired() {
  channel?.postMessage({
    type: 'SESSION_EXPIRED',
    timestamp: Date.now(),
  });
}

export function broadcastSessionRestored(accessToken: string) {
  channel?.postMessage({
    type: 'SESSION_RESTORED',
    accessToken,
    timestamp: Date.now(),
  });
}

export function hasRecentBroadcastToken(): boolean {
  // Returns true if another tab broadcast a token within the last 5 seconds
  return !!lastReceivedToken && Date.now() - lastReceivedTime < 5000;
}

export function getRecentBroadcastToken(): string | null {
  return hasRecentBroadcastToken() ? lastReceivedToken : null;
}
