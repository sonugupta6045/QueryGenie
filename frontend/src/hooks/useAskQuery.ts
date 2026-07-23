import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryApi } from '../api/queryApi';
import { AskQueryRequest } from '../types/query';

export function useAskQuery() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: AskQueryRequest) => queryApi.ask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queryHistory'] });
    },
  });
}
