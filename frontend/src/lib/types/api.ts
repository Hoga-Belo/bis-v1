export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  success: boolean;
  message: string;
  error_code: string;
  errors?: Record<string, string[]>;
  timestamp: string;
  path: string;
}