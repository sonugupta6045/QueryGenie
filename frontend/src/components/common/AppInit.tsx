import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { getNewToken } from '../../api/refreshQueue';

interface AppInitProps {
  children: React.ReactNode;
}

export default function AppInit({ children }: AppInitProps) {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      // If there is a user in storage but no access token in memory,
      // it means the user just opened a new tab or refreshed the page.
      // We must attempt to fetch a new token via the HttpOnly cookie.
      if (user && !isAuthenticated) {
        try {
          await getNewToken();
        } catch (error) {
          // If the refresh fails (e.g. cookie expired), Redux will naturally 
          // clear the session and RoleGuard will redirect to /login.
          console.debug('Session initialization failed, user will be redirected to login.');
        }
      }
      setIsInitializing(false);
    };

    initSession();
  }, [user, isAuthenticated]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-main"></div>
          <p className="mt-4 text-gray-500 text-sm">Restoring session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
