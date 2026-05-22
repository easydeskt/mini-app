import { useQuery } from '@tanstack/react-query';

import { fetchAgents, type ApiAgentResponse } from '@/api/agents';
import { queryKeys } from '@/api/query-keys';
import type { Agent, AgentRole } from '@/types/agent';

export function toAgent(a: ApiAgentResponse): Agent {
  const role = a.role.toUpperCase();
  const name = a.display_name;
  return {
    email: '',
    id: a.id,
    initials: name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?',
    name,
    online: a.is_active,
    role: (role === 'ADMIN' ? 'ADMIN' : 'OPERATOR') as AgentRole,
    username: a.telegram_username ?? '',
  };
}

export function useAgents(): { data: Agent[]; isError: boolean; isLoading: boolean; refetch: () => void; error: unknown } {
  const { data = [], isError, isLoading, refetch, error } = useQuery({
    queryKey: queryKeys.agents.all,
    queryFn: () => fetchAgents(),
    retry: false,
  });
  return { data: data.map(toAgent), isError, isLoading, refetch: () => { void refetch(); }, error };
}
