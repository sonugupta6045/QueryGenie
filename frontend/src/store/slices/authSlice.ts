import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, Role } from '../../types/auth';

interface AuthState {
  user: User | null;
  role: Role | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isSessionExpired: boolean;
}

const getStoredUser = (): User | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const initialState: AuthState = {
  user: getStoredUser(),
  role: getStoredUser()?.role || null,
  accessToken: null, // In-memory only
  isAuthenticated: false,
  isSessionExpired: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>
    ) => {
      state.user = action.payload.user;
      state.role = action.payload.user.role;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isSessionExpired = false;
      
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      // refreshToken is managed via HttpOnly cookies by the backend.
      // accessToken is kept in-memory only.
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
      state.isSessionExpired = false;
    },
    setSessionExpired: (state, action: PayloadAction<boolean>) => {
      state.isSessionExpired = action.payload;
      if (action.payload) {
        state.accessToken = null; // Clear memory on expiry
        state.isAuthenticated = false;
      }
    },
    clearCredentials: (state) => {
      state.user = null;
      state.role = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isSessionExpired = false;
      
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken'); // Cleanup legacy if exists
      localStorage.removeItem('refreshToken'); // Cleanup legacy if exists
    },
  },
});

export const { setCredentials, setAccessToken, setSessionExpired, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
