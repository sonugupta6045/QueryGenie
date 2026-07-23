import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

export function useAuth() {
  const authState = useSelector((state: RootState) => state.auth);
  return {
    user: authState.user,
    role: authState.role,
    isAuthenticated: authState.isAuthenticated,
    accessToken: authState.accessToken,
  };
}
