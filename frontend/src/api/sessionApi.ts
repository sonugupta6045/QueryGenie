import axiosClient from './axiosClient';
import { ApiResponse } from '../types/apiResponse';

export interface UserSession {
  familyId: string;
  deviceLabel: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: string;
  lastUsedAt: string;
  currentSession: boolean;
}

export const sessionApi = {
  getSessions: async (): Promise<UserSession[]> => {
    const res = await axiosClient.get<ApiResponse<UserSession[]>>('/auth/sessions');
    return res.data.data;
  },

  revokeSession: async (familyId: string): Promise<void> => {
    await axiosClient.delete(`/auth/sessions/${familyId}`);
  },

  revokeOtherSessions: async (): Promise<void> => {
    await axiosClient.post('/auth/sessions/revoke-others');
  },
};
