import { apiClient } from './client';

export type ApiTemplateResponse = {
  content: string | null;
  has_attachments: boolean;
  human_name: string;
  id: number;
};

export const createTemplate = (humanName: string, content: string | null) =>
  apiClient.post<ApiTemplateResponse>('/api/v1/templates', { human_name: humanName, content });

export const deleteTemplate = (id: number) =>
  apiClient.delete(`/api/v1/templates/${id}`);

export const fetchTemplate = (id: number) =>
  apiClient.get<ApiTemplateResponse>(`/api/v1/templates/${id}`);

export const fetchTemplates = () =>
  apiClient.get<ApiTemplateResponse[]>('/api/v1/templates');

export const updateTemplate = (id: number, humanName: string, content: string | null) =>
  apiClient.put<ApiTemplateResponse>(`/api/v1/templates/${id}`, { human_name: humanName, content });
