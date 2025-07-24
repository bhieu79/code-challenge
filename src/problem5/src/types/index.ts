export interface Resource {
  id?: number;
  name: string;
  description: string;
  category?: string;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface CreateResourceRequest {
  name: string;
  description: string;
  category?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateResourceRequest {
  name: string;
  description: string;
  category?: string;
  status?: 'active' | 'inactive';
}

export interface PatchResourceRequest {
  name?: string;
  description?: string;
  category?: string;
  status?: 'active' | 'inactive';
}

export interface ResourceFilters {
  category?: string;
  status?: string;
  search?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination?: {
    total: number;
    count: number;
  };
}

export interface DatabaseResult {
  id: number;
  changes: number;
}

export interface HealthResponse {
  success: boolean;
  message: string;
  timestamp: string;
}
