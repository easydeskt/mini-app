import { apiClient } from './client';
import type { ApiTagResponse } from './tags';

export type ApiNoteResponse = {
  author_name: string;
  created_at: string;
  id: number;
  scope: string;
  text: string;
};

export type ApiTicketResponse = {
  attachment_count?: number;
  assigned_agent_id: string | null;
  unread_count?: number;
  client_url?: string | null;
  assigned_at?: string | null;
  channel_name?: string | null;
  client_name?: string | null;
  closed_at?: string | null;
  conversation_id: number;
  created_at: string;
  id: number;
  last_message_at: string;
  merged_at?: string | null;
  merged_into_ticket_id: number | null;
  notes?: ApiNoteResponse[];
  message_preview?: string | null;
  priority?: string | null;
  resolution_note?: string | null;
  resolved_at?: string | null;
  source_type?: string | null;
  status: string;
  tags: ApiTagResponse[];
  topic_url?: string | null;
};

export type TicketFilters = {
  assignedAgentId?: string;
  priority?: string;
  status?: string;
  tagId?: number;
};

export const fetchTickets = (filters?: TicketFilters) => {
  const params = new URLSearchParams();
  if (filters?.assignedAgentId) params.set('assignedAgentId', filters.assignedAgentId);
  if (filters?.priority) params.set('priority', filters.priority);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.tagId !== undefined) params.set('tagId', String(filters.tagId));
  const query = params.toString();
  return apiClient.get<ApiTicketResponse[]>(`/tickets${query ? `?${query}` : ''}`);
};

export const fetchTicket = (id: number) =>
  apiClient.get<ApiTicketResponse>(`/tickets/${id}`);

export const assignTicket = (id: number, agentId: string) =>
  apiClient.post<void>(`/tickets/${id}/assign`, { agent_id: agentId });

export const freeTicket = (id: number) =>
  apiClient.post<void>(`/tickets/${id}/free`);

export const resolveTicket = (id: number) =>
  apiClient.post<void>(`/tickets/${id}/resolve`);

export const closeTicket = (id: number) =>
  apiClient.post<void>(`/tickets/${id}/close`);

export const reopenTicket = (id: number) =>
  apiClient.post<void>(`/tickets/${id}/reopen`);

export const setTicketPriority = (id: number, priority: string | null) =>
  apiClient.post<void>(`/tickets/${id}/priority`, { priority });

export const setTicketTags = (id: number, tagIds: number[]) =>
  apiClient.post<void>(`/tickets/${id}/tags`, { tag_ids: tagIds });

export const mergeTickets = (id: number, targetId: number) =>
  apiClient.post<void>(`/tickets/${id}/merge`, { target_ticket_id: targetId });

export const setTicketAttributes = (id: number, attributes: Record<string, unknown>) =>
  apiClient.patch<void>(`/tickets/${id}/attributes`, attributes);

export const createNote = (ticketId: number, scope: string, text: string) =>
  apiClient.post<ApiNoteResponse>(`/tickets/${ticketId}/notes`, { scope, text });

export const updateNote = (ticketId: number, noteId: number, scope: string, text: string) =>
  apiClient.put<ApiNoteResponse>(`/tickets/${ticketId}/notes/${noteId}`, { scope, text });

export const deleteNote = (ticketId: number, noteId: number, scope: string) =>
  apiClient.delete(`/tickets/${ticketId}/notes/${noteId}?scope=${scope}`);
