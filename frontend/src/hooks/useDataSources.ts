import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataSourceApi } from '../api/dataSourceApi';
import { DataSourceCreateRequest, DataSourceUpdateRequest } from '../types/dataSource';

export function useDataSources(page = 0, size = 100) {
  return useQuery({
    queryKey: ['dataSources', page, size],
    queryFn: () => dataSourceApi.list(page, size),
  });
}

export function useCreateDataSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DataSourceCreateRequest) => dataSourceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] });
    },
  });
}

export function useUpdateDataSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DataSourceUpdateRequest }) => dataSourceApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] });
      queryClient.invalidateQueries({ queryKey: ['dataSource', id] });
    },
  });
}

export function useDeleteDataSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => dataSourceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] });
    },
  });
}

export function useRefreshSchema() {
  return useMutation({
    mutationFn: (id: number) => dataSourceApi.refreshSchema(id),
  });
}
