import { apiClient } from './client';

export type ApiTagResponse = {
  color: number | null;
  created_at: string;
  id: number;
  name: string;
};

export const fetchTags = () => apiClient.get<ApiTagResponse[]>('/tags');

export const createTag = (name: string, color: number | null) =>
  apiClient.post<ApiTagResponse>('/tags', { name, color });

export const updateTag = (id: number, name: string, color: number | null) =>
  apiClient.put<ApiTagResponse>(`/tags/${id}`, { name, color });

export const deleteTag = (id: number) =>
  apiClient.delete(`/tags/${id}`);
