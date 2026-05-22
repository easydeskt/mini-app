import { useQuery } from '@tanstack/react-query';

import { fetchTicket } from '@/api/tickets';
import { queryKeys } from '@/api/query-keys';
import type { Ticket } from '@/types/ticket';
import { toTicket } from './useTickets';

export function useTicket(id: number): { data: Ticket | undefined; isError: boolean; isLoading: boolean; refetch: () => void; error: unknown } {
  const { data, isError, isLoading, refetch, error } = useQuery({
    queryKey: queryKeys.tickets.detail(id),
    queryFn: () => fetchTicket(id),
    retry: false,
  });
  return {
    data: data ? toTicket(data) : undefined,
    isError,
    isLoading,
    refetch: () => { void refetch(); },
    error,
  };
}
