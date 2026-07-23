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

  refresh: async (request: RefreshTokenRequest): Promise<AuthResponse> => {
    const res = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/refresh', request);
    return res.data.data;
  },

  logout: async (request: RefreshTokenRequest): Promise<void> => {
    await axiosClient.post('/auth/logout', request);
  },
};
