import { initDataUser } from '@telegram-apps/sdk-react';
import { useQuery } from '@tanstack/react-query';

import { fetchMe } from '@/api/me';
import { queryKeys } from '@/api/query-keys';
import type { AgentRole } from '@/types/agent';

export type CurrentAgent = {
  avgResponseMinutes: number | null;
  email: string;
  id: string;
  initials: string;
  joinedAt: string;
  name: string;
  online: boolean;
  resolvedToday: number;
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
  locale: string,
): CurrentAgent {
  const { agent } = me;
  const name = agent.display_name;
  return {
    avgResponseMinutes: me.avg_response_minutes ?? null,
    email: '',
    id: agent.id,
    initials: name[0]?.toUpperCase() ?? '?',
    joinedAt: new Date(agent.created_at).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    name,
    online: agent.is_active,
    resolvedToday: me.resolved_today,
    role: parseRole(agent.role),
    username: telegramUsername ?? '',
    workspace: 'EasyDesk',
  };
}

export function useCurrentAgent(): { data: CurrentAgent | undefined; error: unknown; isLoading: boolean } {
  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.me,
    queryFn: fetchMe,
    retry: false,
  });

  let telegramUsername: string | undefined;
  let locale = 'en-US';
  try {
    const tgUser = initDataUser();
    telegramUsername = tgUser?.username;
    locale = tgUser?.language_code === 'ru' ? 'ru-RU' : 'en-US';
  } catch {
    telegramUsername = undefined;
  }

  return { data: data ? toCurrentAgent(data, telegramUsername, locale) : undefined, error, isLoading };
}
