import axiosClient from './axiosClient';
import { ApiResponse, PageResponse } from '../types/apiResponse';
import { 
  DataSourceResponse, 
  DataSourceCreateRequest, 
  DataSourceUpdateRequest, 
  SchemaRefreshSummary 
} from '../types/dataSource';

export const dataSourceApi = {
  list: async (page = 0, size = 20): Promise<PageResponse<DataSourceResponse>> => {
    const res = await axiosClient.get<ApiResponse<PageResponse<DataSourceResponse>>>(`/data-sources?page=${page}&size=${size}`);
    return res.data.data;
  },

  getById: async (id: number): Promise<DataSourceResponse> => {
    const res = await axiosClient.get<ApiResponse<DataSourceResponse>>(`/data-sources/${id}`);
    return res.data.data;
  },

  create: async (request: DataSourceCreateRequest): Promise<DataSourceResponse> => {
    const res = await axiosClient.post<ApiResponse<DataSourceResponse>>('/data-sources', request);
    return res.data.data;
  },

  update: async (id: number, request: DataSourceUpdateRequest): Promise<DataSourceResponse> => {
    const res = await axiosClient.put<ApiResponse<DataSourceResponse>>(`/data-sources/${id}`, request);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/data-sources/${id}`);
  },

  refreshSchema: async (id: number): Promise<SchemaRefreshSummary> => {
    const res = await axiosClient.post<ApiResponse<SchemaRefreshSummary>>(`/data-sources/${id}/refresh-schema`);
    return res.data.data;
  },

  getSchema: async (id: number): Promise<string> => {
    const res = await axiosClient.get<ApiResponse<string>>(`/data-sources/${id}/schema`);
    return res.data.data;
  },
};
