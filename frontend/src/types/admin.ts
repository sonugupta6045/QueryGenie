import { Role } from './auth';

export interface UsageAnalyticsResponse {
  totalQueries: number;
  successRate: number;
  avgLatencyMs: number;
  byDataSource: { dataSourceId: number; dataSourceName: string; queryCount: number }[];
}

export interface TopQuestionResponse {
  question: string;
  count: number;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: Role;
}
