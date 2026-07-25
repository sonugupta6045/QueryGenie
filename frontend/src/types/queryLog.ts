import { ExecutionStatus } from './query';

export interface QueryLogResponse {
  id: number;
  userId: number;
  dataSourceId: number;
  dataSourceName?: string;
  questionText: string;
  generatedSql?: string;
  executionStatus: ExecutionStatus;
  executionTimeMs?: number;
  errorMessage?: string;
  createdAt: string;
}
