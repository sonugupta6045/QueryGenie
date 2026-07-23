export type ExecutionStatus = 'SUCCESS' | 'REJECTED' | 'FAILED' | 'CLARIFICATION_NEEDED';

export interface AskQueryRequest {
  dataSourceId: number;
  question: string;
}

export interface EditSqlRequest {
  editedSql: string;
}

export interface ColumnMeta {
  name: string;
  type: string;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'table';
  xKey?: string;
  yKey?: string;
}

export interface QueryResultResponse {
  sql?: string;
  columns?: ColumnMeta[];
  rows?: any[][];
  chart?: ChartConfig;
  explanation?: string;
  status: ExecutionStatus;
  clarificationMessage?: string;
  executionTimeMs?: number;
}
