import { useQuery } from '@tanstack/react-query';

import { fetchAgent } from '@/api/agents';
import { queryKeys } from '@/api/query-keys';
import type { Agent } from '@/types/agent';
import { toAgent } from './useAgents';

export function useAgent(id: string | undefined): { data: Agent | undefined; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.agents.detail(id ?? ''),
    queryFn: () => fetchAgent(id!),
    enabled: Boolean(id),
    retry: false,
  });
  return { data: data ? toAgent(data) : undefined, isLoading };
}
