import axiosClient from './axiosClient';
import { ApiResponse, PageResponse } from '../types/apiResponse';
import { UsageAnalyticsResponse, UserResponse, TopQuestionResponse } from '../types/admin';

export const adminApi = {
  getUsage: async (): Promise<UsageAnalyticsResponse> => {
    const res = await axiosClient.get<ApiResponse<UsageAnalyticsResponse>>('/admin/analytics/usage');
    return res.data.data;
  },

  getTopQuestions: async (): Promise<TopQuestionResponse[]> => {
    const res = await axiosClient.get<ApiResponse<TopQuestionResponse[]>>('/admin/analytics/top-questions');
    return res.data.data;
  },

  listUsers: async (page = 0, size = 20): Promise<PageResponse<UserResponse>> => {
    const res = await axiosClient.get<ApiResponse<PageResponse<UserResponse>>>(`/admin/users?page=${page}&size=${size}`);
    return res.data.data;
  },

  updateUserRole: async (id: number, role: string): Promise<string> => {
    const res = await axiosClient.patch<ApiResponse<string>>(`/admin/users/${id}/role`, { role });
    return res.data.data;
  },
};
