import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { authApi } from '../api/authApi';
import { clearCredentials } from '../store/slices/authSlice';
import { clearProactiveRefresh } from '../api/tokenScheduler';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_PERIOD_MS = 1 * 60 * 1000; // 1 minute warning
const IDLE_WARN_THRESHOLD_MS = IDLE_TIMEOUT_MS - WARNING_PERIOD_MS; // 29 minutes

export function useIdleTimeout() {
  const dispatch = useDispatch();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(60);

  const lastActivityRef = useRef<number>(Date.now());
  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetActivity = () => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
    }
    scheduleTimers();
  };

  const handleLogoutDueToIdle = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error('Idle logout error', e);
    } finally {
      clearProactiveRefresh();
      dispatch(clearCredentials());
      window.location.href = '/login?reason=idle';
    }
  };

  const scheduleTimers = () => {
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    warnTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setRemainingSeconds(60);

      countdownIntervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      logoutTimerRef.current = setTimeout(() => {
        handleLogoutDueToIdle();
      }, WARNING_PERIOD_MS);
    }, IDLE_WARN_THRESHOLD_MS);
  };

  useEffect(() => {
    let throttleTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleUserActivity = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
          // Only reset if modal is not currently open
          if (!showWarning) {
            resetActivity();
          }
        }, 1000);
      }
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);

    scheduleTimers();

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [showWarning]);

  return {
    showWarning,
    remainingSeconds,
    stayLoggedIn: resetActivity,
    logoutNow: handleLogoutDueToIdle,
  };
}
