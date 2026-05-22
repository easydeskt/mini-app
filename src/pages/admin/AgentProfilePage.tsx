import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';

import { InfoRow } from '@/components/shared/InfoRow';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAgent } from '@/hooks/queries/useAgent';
import { useBackButton } from '@/hooks/useBackButton';
import { useT } from '@/hooks/useT';
import type { AgentRole } from '@/types/agent';

export function AgentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = useT();
  const { data: agent, isLoading } = useAgent(id);

  useBackButton();

  const ROLE_LABEL: Record<AgentRole, string> = {
    ADMIN: t('profile.role_admin') ?? 'Administrator',
    OPERATOR: t('profile.role_operator') ?? 'Operator',
  };

  const noData = isLoading || !agent;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background/80 px-4 py-3 backdrop-blur-md">
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 rounded-full"
          onClick={() => void navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        {noData ? (
          <Skeleton className="mx-auto h-5 w-32" />
        ) : (
          <h1 className="flex-1 text-center text-base font-semibold">{agent.name}</h1>
        )}
        <div className="size-9 shrink-0" />
      </div>

      <div className="space-y-4 p-4 pb-8">

        <Card className="py-0">
          <CardContent className="flex items-center gap-4 p-4">
            {noData ? (
              <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
            ) : (
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">{agent.initials}</AvatarFallback>
              </Avatar>
            )}
            <div className="min-w-0 flex-1">
              {noData ? (
                <div className="space-y-1.5">
                  <Skeleton className="h-6 w-36" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <p className="truncate text-xl font-semibold">{agent.name}</p>
                    <Badge
                      className={
                        agent.online
                          ? 'border-transparent bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                          : 'border-transparent bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                      }
                    >
                      {agent.online ? t('profile.status_online') : t('profile.status_offline')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{ROLE_LABEL[agent.role]}</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <div>
          <p className="mb-1.5 px-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {t('profile.section_info') ?? 'Info'}
          </p>
          <Card className="py-0">
            <CardContent className="p-0">
              <InfoRow label={t('profile.field_name') ?? 'Name'} value={agent?.name} loading={noData} skeletonWidth="w-32" />
              <div className="mx-4 h-px bg-border" />
              <InfoRow label={t('profile.field_telegram') ?? 'Telegram'} value={agent ? (agent.username ? `@${agent.username}` : (t('profile.field_not_set') ?? 'Not set')) : undefined} loading={noData} mono={Boolean(agent?.username)} unset={agent ? !agent.username : false} skeletonWidth="w-36" />
              <div className="mx-4 h-px bg-border" />
              <InfoRow
                label={t('profile.field_email') ?? 'Email'}
                value={agent?.email || (!noData ? (t('profile.field_not_set') ?? 'Not set') : undefined)}
                loading={noData}
                unset={agent ? !agent.email : false}
                skeletonWidth="w-48"
              />
              <div className="mx-4 h-px bg-border" />
              <InfoRow label={t('profile.field_role') ?? 'Role'} value={agent ? ROLE_LABEL[agent.role] : undefined} loading={noData} skeletonWidth="w-24" />
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

