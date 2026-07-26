import axios from 'axios';
import { store } from '../store/store';
import { setAccessToken, setSessionExpired } from '../store/slices/authSlice';
import {
  broadcastSessionExpired,
  broadcastTokenRefreshed,
  hasRecentBroadcastToken,
  getRecentBroadcastToken
} from './sessionSync';
import { scheduleProactiveRefresh } from './tokenScheduler';
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

export const getNewToken = async (): Promise<string> => {
  // If another tab recently broadcast a fresh token, return it immediately without calling network
  if (hasRecentBroadcastToken()) {
    const recentToken = getRecentBroadcastToken();
    if (recentToken) {
      store.dispatch(setAccessToken(recentToken));
      scheduleProactiveRefresh();
      return recentToken;
    }
  }

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const res = await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
    const newAccessToken = res.data.data.accessToken;

    store.dispatch(setAccessToken(newAccessToken));
    broadcastTokenRefreshed(newAccessToken);
    scheduleProactiveRefresh();

    processQueue(null, newAccessToken);
    return newAccessToken;
  } catch (error) {
    processQueue(error, null);
    store.dispatch(setSessionExpired(true));
    broadcastSessionExpired();
    throw error;
  } finally {
    isRefreshing = false;
  }
};
