import axiosClient from './axiosClient';
import { ApiResponse } from '../types/apiResponse';
import { AuthResponse, LoginRequest, RegisterRequest, RefreshTokenRequest } from '../types/auth';

export const authApi = {
  login: async (request: LoginRequest): Promise<AuthResponse> => {
    const res = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/login', request);
    return res.data.data;
  },
  
  register: async (request: RegisterRequest): Promise<AuthResponse> => {
    const res = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/register', request);
    return res.data.data;
  },

  refresh: async (): Promise<AuthResponse> => {
    // refresh token is now sent automatically via HttpOnly cookie
    const res = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/refresh');
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    // logout uses the HttpOnly cookie
    await axiosClient.post('/auth/logout');
  },
};
