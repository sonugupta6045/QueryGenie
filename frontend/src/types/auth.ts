export type Role = 'SUPER_ADMIN' | 'DATA_SOURCE_ADMIN' | 'ANALYST' | 'API_CONSUMER';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string; // No longer returned by backend (HttpOnly cookie)
  tokenType: string;
  userId: number;
  name: string;
  email: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
  role: Role;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
