import axiosClient from './axiosClient';
import { ApiResponse, PageResponse } from '../types/apiResponse';
import { QueryLogResponse } from '../types/queryLog';

export const queryLogApi = {
  list: async (
    page = 0,
    size = 20,
    dataSourceId?: number,
    status?: string,
    search?: string
  ): Promise<PageResponse<QueryLogResponse>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (dataSourceId) params.append('dataSourceId', dataSourceId.toString());
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    const res = await axiosClient.get<ApiResponse<PageResponse<QueryLogResponse>>>(`/query-logs?${params.toString()}`);
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
