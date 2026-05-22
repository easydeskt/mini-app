import { apiClient } from './client';

export type ApiAgentResponse = {
  added_by_agent_id: string | null;
  created_at: string;
  display_name: string;
  id: string;
  is_active: boolean;
  role: string;
  telegram_username: string | null;
  updated_at: string;
};

export const fetchAgent = (id: string) =>
  apiClient.get<ApiAgentResponse>(`/api/agents/${id}`);

export const fetchAgents = (activeOnly = true) =>
  apiClient.get<ApiAgentResponse[]>(`/api/agents?activeOnly=${activeOnly}`);
