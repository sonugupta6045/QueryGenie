import axiosClient from './axiosClient';
import { ApiResponse } from '../types/apiResponse';
import { AskQueryRequest, QueryResultResponse, EditSqlRequest } from '../types/query';
import { QueryLogResponse } from '../types/queryLog';

export const queryApi = {
  ask: async (request: AskQueryRequest): Promise<QueryResultResponse> => {
    const res = await axiosClient.post<ApiResponse<QueryResultResponse>>('/queries/ask', request);
    return res.data.data;
  },

  rerun: async (logId: number, request: EditSqlRequest): Promise<QueryResultResponse> => {
    const res = await axiosClient.post<ApiResponse<QueryResultResponse>>(`/queries/${logId}/rerun`, request);
    return res.data.data;
  },

  getLog: async (logId: number): Promise<QueryLogResponse> => {
    const res = await axiosClient.get<ApiResponse<QueryLogResponse>>(`/queries/${logId}`);
    return res.data.data;
  },
};
