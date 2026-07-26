import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { setCredentials, clearCredentials } from '../../store/slices/authSlice';
import { broadcastSessionRestored } from '../../api/sessionSync';
import axiosClient from '../../api/axiosClient';

const SessionExpiredModal: React.FC = () => {
  const isSessionExpired = useSelector((state: RootState) => state.auth.isSessionExpired);
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If session is not expired, do not render anything
  if (!isSessionExpired) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setError(null);

    try {
      // Re-authenticate
      const res = await axiosClient.post('/auth/login', {
        email: user?.email,
        password,
      });

      const data = res.data.data;
      dispatch(
        setCredentials({
          user: {
            id: data.userId,
            name: data.name,
            email: data.email,
            role: data.role,
          },
          accessToken: data.accessToken,
        })
      );
      
      broadcastSessionRestored(data.accessToken);
      
      // Clear password field
      setPassword('');

      // We do not need to redirect; they are still on their current page!
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(clearCredentials());
    // Preserve current URL so they can come back
    const currentUrl = window.location.pathname + window.location.search;
    window.location.href = `/login?returnUrl=${encodeURIComponent(currentUrl)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Session Expired</h2>
          <p className="text-sm text-gray-600 mb-6">
            For your security, your session has expired. Please re-enter your password to continue without losing your work.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Restore Session'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleLogout}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Sign in with a different account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
