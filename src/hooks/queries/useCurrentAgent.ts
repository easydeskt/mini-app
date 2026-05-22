import { initDataUser } from '@telegram-apps/sdk-react';
import { useQuery } from '@tanstack/react-query';

import { fetchMe } from '@/api/me';
import { queryKeys } from '@/api/query-keys';
import type { AgentRole } from '@/types/agent';

export type CurrentAgent = {
  email: string;
  id: string;
  initials: string;
  joinedAt: string;
  name: string;
  online: boolean;
  role: AgentRole;
  username: string;
  workspace: string;
};

function parseRole(raw: string): AgentRole {
  const upper = raw.toUpperCase();
  return upper === 'ADMIN' ? 'ADMIN' : 'OPERATOR';
}

function toCurrentAgent(
  me: Awaited<ReturnType<typeof fetchMe>>,
  telegramUsername: string | undefined,
): CurrentAgent {
  const { agent } = me;
  const name = agent.display_name;
  return {
    email: '',
    id: agent.id,
    initials: name[0]?.toUpperCase() ?? '?',
    joinedAt: new Date(agent.created_at).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    name,
    online: agent.is_active,
    role: parseRole(agent.role),
    username: telegramUsername ?? '',
    workspace: 'EasyDesk',
  };
}

export function useCurrentAgent(): { data: CurrentAgent | undefined; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.me,
    queryFn: fetchMe,
    retry: false,
  });

  let telegramUsername: string | undefined;
  try {
    telegramUsername = initDataUser()?.username;
  } catch {
    telegramUsername = undefined;
  }

  return { data: data ? toCurrentAgent(data, telegramUsername) : undefined, isLoading };
}
