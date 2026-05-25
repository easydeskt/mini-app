import type { ApiAttachmentKind } from '@/types/template';

import { apiClient, getAuthHeader, getBaseUrl } from './client';

export type ApiTemplateAttachment = {
  attachment_id: number;
  attributes?: Record<string, unknown>;
  content_type: string;
  file_name: string;
  file_size: number;
  kind: ApiAttachmentKind;
  template_id: number;
};

export type ApiTemplateResponse = {
  attachments: ApiTemplateAttachment[];
  content: string | null;
  human_name: string;
  id: number;
};

export const createTemplate = (humanName: string, content: string | null) =>
  apiClient.post<ApiTemplateResponse>('/templates', { human_name: humanName, content });

export const deleteTemplate = (id: number) =>
  apiClient.delete(`/templates/${id}`);

export const fetchTemplate = (id: number) =>
  apiClient.get<ApiTemplateResponse>(`/templates/${id}`);

export const fetchTemplates = () =>
  apiClient.get<ApiTemplateResponse[]>('/templates');

export const updateTemplate = (id: number, humanName: string, content: string | null) =>
  apiClient.put<ApiTemplateResponse>(`/templates/${id}`, { human_name: humanName, content });

export const uploadTemplateAttachment = (templateId: number, kind: ApiAttachmentKind, file: File): Promise<ApiTemplateAttachment> => {
  const form = new FormData();
  form.append('kind', kind);
  form.append('file', file);
  return apiClient.postForm<ApiTemplateAttachment>(`/templates/${templateId}/attachments`, form);
};

export const reorderTemplateAttachments = (templateId: number, attachmentIds: number[]): Promise<void> =>
  apiClient.put<void>(`/templates/${templateId}/attachments/order`, { attachment_ids: attachmentIds });

export const deleteTemplateAttachment = (templateId: number, attachmentId: number): Promise<void> =>
  apiClient.delete(`/templates/${templateId}/attachments/${attachmentId}`);

export const getTemplateAttachmentContentUrl = (templateId: number, attachmentId: number): string => {
  const auth = getAuthHeader();
  const raw = auth?.startsWith('tma ') ? auth.slice(4) : null;
  const base = `${getBaseUrl()}/templates/${templateId}/attachments/${attachmentId}/content`;
  return raw ? `${base}?tma_auth=${encodeURIComponent(raw)}` : base;
};

export const fetchTemplateAttachmentBlobUrl = async (templateId: number, attachmentId: number): Promise<string> => {
  const auth = getAuthHeader();
  const res = await fetch(getTemplateAttachmentContentUrl(templateId, attachmentId), {
    headers: auth ? { Authorization: auth } : {},
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
};
