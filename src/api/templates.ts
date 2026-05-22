import { apiClient } from './client';

export type ApiTemplateResponse = {
  content: string | null;
  has_attachments: boolean;
  human_name: string;
  id: number;
};

export const fetchTemplate = (id: number) =>
  apiClient.get<ApiTemplateResponse>(`/api/v1/templates/${id}`);

export const fetchTemplates = () =>
  apiClient.get<ApiTemplateResponse[]>('/api/v1/templates');
