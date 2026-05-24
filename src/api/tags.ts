import { apiClient } from './client';

export type ApiTagResponse = {
  color: number | null;
  created_at: string;
  id: number;
  name: string;
};

export const fetchTags = () => apiClient.get<ApiTagResponse[]>('/api/v1/tags');

export const createTag = (name: string, color: number | null) =>
  apiClient.post<ApiTagResponse>('/api/v1/tags', { name, color });

export const updateTag = (id: number, name: string, color: number | null) =>
  apiClient.put<ApiTagResponse>(`/api/v1/tags/${id}`, { name, color });

export const deleteTag = (id: number) =>
  apiClient.delete(`/api/v1/tags/${id}`);
