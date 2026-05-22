import { useQuery } from '@tanstack/react-query';

import { fetchMe } from '@/api/me';
import { queryKeys } from '@/api/query-keys';

export type WorkspaceStats = {
  avgResponseTime: string;
  inProgressTickets: number;
  openTickets: number;
  resolvedRate: string;
};

export function useWorkspaceStats(): { data: WorkspaceStats | undefined; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.me,
    queryFn: fetchMe,
    retry: false,
  });

  if (!data) return { data: undefined, isLoading };

  return {
    data: {
      avgResponseTime: '—',
      inProgressTickets: data.in_progress_ticket_count,
      openTickets: data.open_ticket_count,
      resolvedRate: '—',
    },
    isLoading,
  };
}
