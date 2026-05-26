import { type ReactNode } from 'react';

import { initData, useSignal } from '@telegram-apps/sdk-react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';

import { DEV_SERVER_KEY, KNOWN_SERVERS, MOCK_DEMO_VALUE, setDevServer } from '@/api/client';
import { InfoRow } from '@/components/shared/InfoRow';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBackButton } from '@/hooks/useBackButton';
import { useCurrentAgent } from '@/hooks/queries/useCurrentAgent';
import { useT } from '@/hooks/useT';
import type { AgentRole } from '@/types/agent';

function getServerLabel(t: (key: string) => string): string {
  const stored = localStorage.getItem(DEV_SERVER_KEY);
  if (!stored || stored === KNOWN_SERVERS.production) return t('profile.server_production');
  if (stored === KNOWN_SERVERS.development) return t('profile.server_development');
  if (stored === MOCK_DEMO_VALUE) return t('profile.server_demo');
  try { return new URL(stored).hostname; } catch { return stored; }
}

function formatAvgResponse(minutes: number | null, lang: string): string {
  if (minutes === null) return '—';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (lang === 'ru') {
    if (h === 0) return `${m}мин`;
    if (m === 0) return `${h}ч`;
    return `${h}ч ${m}м`;
  }
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const tgUser = useSignal(initData.user);
  const { data: agent, isLoading } = useCurrentAgent();

  useBackButton();

  const t = useT();
  const lang = tgUser?.language_code === 'ru' ? 'ru' : 'en';

  const ROLE_LABEL: Record<AgentRole, string> = {
    ADMIN: t('profile.role_admin') ?? 'Administrator',
    OPERATOR: t('profile.role_operator') ?? 'Operator',
  };

  const photoUrl = tgUser?.photo_url;
  const noData = isLoading || !agent;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="mx-auto w-full max-w-[480px] space-y-4 px-4 pb-8 pt-4">

        <Card className="py-0">
          <CardContent className="flex items-center gap-4 p-4">
            <Avatar className="h-16 w-16">
              {photoUrl && <AvatarImage src={photoUrl} />}
              <AvatarFallback className="text-lg">{agent?.initials ?? '?'}</AvatarFallback>
            </Avatar>
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
          <StatCard value={String(agent?.resolvedToday ?? 0)} label={t('profile.stats_resolved_today') ?? ''} loading={noData} skeletonWidth="w-8" />
          <StatCard value={formatAvgResponse(agent?.avgResponseMinutes ?? null, lang)} label={t('profile.stats_avg_response') ?? ''} loading={noData} skeletonWidth="w-12" />
          <StatCard
            value="—"
            label={t('profile.stats_rating') ?? ''}
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
              <InfoRow label={t('profile.field_telegram') ?? 'Telegram'} value={tgUser?.username ? `@${tgUser.username}` : undefined} mono skeletonWidth="w-36" />
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

        <div>
          <p className="mb-1.5 px-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {t('profile.section_workspace') ?? 'Workspace'}
          </p>
          <Card className="overflow-hidden py-0">
            <CardContent className="p-0">
              <InfoRow label={t('profile.field_workspace_name') ?? 'Name'} value={agent?.workspace} loading={noData} skeletonWidth="w-28" />
              {agent?.role === 'ADMIN' && (
                <>
                  <div className="mx-4 h-px bg-border" />
                  <NavRow label={t('profile.field_workspace_manage') ?? 'Manage'} onClick={() => { void navigate('/admin'); }} />
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {import.meta.env.DEV && (
          <div>
            <p className="mb-1.5 px-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('profile.section_connection')}
            </p>
            <Card className="overflow-hidden py-0">
              <CardContent className="p-0">
                <InfoRow label={t('profile.field_server')} value={getServerLabel(t)} />
                <div className="mx-4 h-px bg-border" />
                <NavRow label={t('profile.action_change_server')} onClick={() => { setDevServer(null); window.location.reload(); }} />
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-center">
          {noData ? (
            <Skeleton className="h-3.5 w-48" />
          ) : (
            <p className="text-center text-xs text-muted-foreground">
              {t('profile.field_workspace_since') ?? 'Member since'} {agent.joinedAt}
            </p>
          )}
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

type NavRowProps = { label: string; onClick: () => void };

function NavRow({ label, onClick }: NavRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left transition-colors hover:bg-muted/50 active:bg-muted"
    >
      <span className="text-sm">{label}</span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}
