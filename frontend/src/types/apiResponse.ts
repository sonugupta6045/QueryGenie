export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: ErrorDetails;
}

export interface ErrorDetails {
  code: string;
  message: string;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
