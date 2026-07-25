import { useQuery } from '@tanstack/react-query';
import { queryLogApi } from '../api/queryLogApi';

export function useQueryHistory(page = 0, size = 20, dataSourceId?: number, status?: string, search?: string) {
  return useQuery({
    queryKey: ['queryHistory', page, size, dataSourceId, status, search],
    queryFn: () => queryLogApi.list(page, size, dataSourceId, status, search),
  });
}
