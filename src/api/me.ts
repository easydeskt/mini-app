import { apiClient } from './client';
import type { ApiAgentResponse } from './agents';

export type MeResponse = {
  agent: ApiAgentResponse;
  in_progress_ticket_count: number;
  open_ticket_count: number;
};

export const fetchMe = () => apiClient.get<MeResponse>('/api/v1/me');
