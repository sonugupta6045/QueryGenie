export interface DataSourceResponse {
  id: number;
  name: string;
  ownerId: number;
  dbHost: string;
  dbPort: number;
  dbName: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataSourceCreateRequest {
  name: string;
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUsername: string;
  dbPassword?: string;
}

export interface DataSourceUpdateRequest {
  name?: string;
  dbHost?: string;
  dbPort?: number;
  dbName?: string;
  dbUsername?: string;
  dbPassword?: string;
}

export interface SchemaRefreshSummary {
  tableCount: number;
  columnCount: number;
  cachedAt: string;
}
