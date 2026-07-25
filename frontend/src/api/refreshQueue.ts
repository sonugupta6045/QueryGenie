import axios from 'axios';
import { store } from '../store/store';
import { setAccessToken, setSessionExpired } from '../store/slices/authSlice';
import { broadcastSessionExpired, broadcastSessionRestored } from './sessionSync';

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
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    // Call the API to refresh the token. 
    // Uses HttpOnly cookie, so no body parameters are needed.
    const res = await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });

    // The response returns the new access token.
    const newAccessToken = res.data.data.accessToken;

    store.dispatch(setAccessToken(newAccessToken));
    broadcastSessionRestored();

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
