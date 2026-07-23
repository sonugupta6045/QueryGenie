import axiosClient from './axiosClient';
import { ApiResponse, PageResponse } from '../types/apiResponse';
import { QueryLogResponse } from '../types/queryLog';

export const queryLogApi = {
  list: async (page = 0, size = 20): Promise<PageResponse<QueryLogResponse>> => {
    // Note: The backend route is /api/v1/query-logs
    const res = await axiosClient.get<ApiResponse<PageResponse<QueryLogResponse>>>(`/query-logs?page=${page}&size=${size}`);
    return res.data.data;
  },

  exportCsv: async (id: number): Promise<Blob> => {
    // We expect a blob back (text/csv)
    const res = await axiosClient.get(`/query-logs/${id}/export`, {
      responseType: 'blob',
    });
    return res.data;
  },
};
