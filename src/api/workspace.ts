import { apiClient } from './client';

export type WorkspaceResponse = {
  name: string;
  version: string;
  started_at: number;
  superadmin_id: string | null;
  metrics: {
    avg_response_time: number;
    tickets_counters: {
      open: number;
      in_progress: number;
      resolved: number;
      closed: number;
      merged: number;
    };
  };
};

export const fetchWorkspace = () => apiClient.get<WorkspaceResponse>('/workspace');
