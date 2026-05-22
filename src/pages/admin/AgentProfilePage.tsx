import { type ReactNode } from 'react';

import { Star } from 'lucide-react';
import { useParams } from 'react-router';

import { InfoRow } from '@/components/shared/InfoRow';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAgent } from '@/hooks/queries/useAgent';
import { useBackButton } from '@/hooks/useBackButton';
import { useT } from '@/hooks/useT';
import type { AgentRole } from '@/types/agent';

export function AgentProfilePage() {
  const { id } = useParams<{ id: string }>();
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
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-[480px] px-4 pb-3 pt-4">
          {noData ? (
            <Skeleton className="h-8 w-40" />
          ) : (
            <h1 className="text-2xl font-bold tracking-tight">{agent.name}</h1>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[480px] space-y-4 px-4 pb-8 pt-4">

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

        <div className="grid grid-cols-3 gap-2">
          <StatCard value="12" label={t('profile.stats_resolved_today') ?? ''} loading={noData} skeletonWidth="w-8" />
          <StatCard value="2 ч" label={t('profile.stats_avg_response') ?? ''} loading={noData} skeletonWidth="w-12" />
          <StatCard
            value="4.9"
            label={t('profile.stats_rating') ?? ''}
            icon={<Star className="h-4 w-4 fill-current" />}
            loading={noData}
            skeletonWidth="w-10"
          />
        </div>

        <div>
          <p className="mb-1.5 px-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {t('profile.section_info') ?? 'Info'}
          </p>
          <Card className="py-0">
            <CardContent className="p-0">
              <InfoRow label={t('profile.field_name') ?? 'Name'} value={agent?.name} loading={noData} skeletonWidth="w-32" />
              <div className="mx-4 h-px bg-border" />
              <InfoRow label={t('profile.field_telegram') ?? 'Telegram'} value={agent ? (agent.username ? `@${agent.username}` : '—') : undefined} loading={noData} mono={Boolean(agent?.username)} unset={agent ? !agent.username : false} skeletonWidth="w-36" />
              <div className="mx-4 h-px bg-border" />
              <InfoRow
                label={t('profile.field_email') ?? 'Email'}
                value={agent?.email || (!noData ? '—' : undefined)}
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

type StatCardProps = { value: string; label: string; icon?: ReactNode; loading?: boolean; skeletonWidth?: string };

function StatCard({ value, label, icon, loading, skeletonWidth = 'w-10' }: StatCardProps) {
  return (
    <Card className="py-0">
      <CardContent className="flex flex-col gap-1 p-4">
        <div className="flex items-center gap-1">
          {loading ? (
            <Skeleton className={`h-7 ${skeletonWidth}`} />
          ) : (
            <>
              <span className="text-xl font-bold">{value}</span>
              {icon && <span className="text-muted-foreground">{icon}</span>}
            </>
          )}
        </div>
        <span className="whitespace-pre-line text-xs leading-tight text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}
