import { getNewToken } from './refreshQueue';
import { hasRecentBroadcastToken } from './sessionSync';

const ACCESS_TOKEN_LIFETIME_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_MARGIN_MS = 2 * 60 * 1000; // 2 minutes before expiry (at 13 mins)
const PROACTIVE_REFRESH_DELAY_MS = ACCESS_TOKEN_LIFETIME_MS - REFRESH_MARGIN_MS; // 780,000 ms

let proactiveTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleProactiveRefresh() {
  clearProactiveRefresh();

  proactiveTimer = setTimeout(async () => {
    try {
      // If another tab already broadcast a new token recently, don't fire an extra network request
      if (!hasRecentBroadcastToken()) {
        await getNewToken();
      }
    } catch (e) {
      console.warn('Proactive silent refresh failed, fallback to 401 reactive refresh:', e);
    }
  }, PROACTIVE_REFRESH_DELAY_MS);
}

export function clearProactiveRefresh() {
  if (proactiveTimer) {
    clearTimeout(proactiveTimer);
    proactiveTimer = null;
  }
}
