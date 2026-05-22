import { apiClient } from './client';

export type ApiTagResponse = {
  color: number | null;
  created_at: string;
  id: number;
  name: string;
};

export const fetchTags = () => apiClient.get<ApiTagResponse[]>('/api/tags');
