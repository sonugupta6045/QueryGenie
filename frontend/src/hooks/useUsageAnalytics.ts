import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';

export function useUsageAnalytics() {
  return useQuery({
    queryKey: ['admin', 'analytics', 'usage'],
    queryFn: adminApi.getUsage,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useTopQuestions() {
  return useQuery({
    queryKey: ['admin', 'analytics', 'top-questions'],
    queryFn: adminApi.getTopQuestions,
    staleTime: 60 * 1000,
  });
}
