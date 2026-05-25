import { apiClient } from './client';
import type { ApiAgentResponse } from './agents';

export type MeResponse = {
  agent: ApiAgentResponse;
  avg_response_minutes?: number;
  in_progress_ticket_count: number;
  open_ticket_count: number;
  resolved_today: number;
};

export const fetchMe = () => apiClient.get<MeResponse>('/me');
