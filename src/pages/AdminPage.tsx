import { type ReactNode } from 'react';

import { ChevronRight, MessageCircleMore, MonitorSmartphone, Tag, Users } from 'lucide-react';
import { useNavigate } from 'react-router';

import { InfoRow } from '@/components/shared/InfoRow';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBackButton } from '@/hooks/useBackButton';
import { useCurrentAgent } from '@/hooks/queries/useCurrentAgent';
import { useT } from '@/hooks/useT';
import { useWorkspaceStats } from '@/hooks/queries/useWorkspaceStats';

const APP_VERSION = '0.1.0';
const BACKEND_VERSION = '0.21.0';

const MGMT_ROUTES = [
  { icon: Users, key: 'nav_agents', route: '/admin/agents' },
  { icon: Tag, key: 'nav_tags', route: '/admin/tags' },
  { icon: MessageCircleMore, key: 'nav_templates', route: '/admin/templates' },
  { icon: MonitorSmartphone, key: 'nav_channels', route: '/admin/channels' },
] as const;

export function AdminPage() {
  const navigate = useNavigate();
  const { data: agent, isLoading: agentLoading } = useCurrentAgent();
  const { data: stats, isLoading: statsLoading } = useWorkspaceStats();
  const t = useT();

  useBackButton();

  const isLoading = agentLoading || statsLoading;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="sticky top-0 z-10 bg-background/80 px-4 pb-3 pt-4 backdrop-blur-md">
        {isLoading ? (
          <Skeleton className="h-9 w-32" />
        ) : (
          <>
            <h1 className="text-3xl font-bold tracking-tight">{agent?.workspace ?? 'EasyDesk'}</h1>
            <p className="text-sm text-muted-foreground">{t('admin.page_title') ?? 'Workspace management'}</p>
          </>
        )}
      </div>

      <div className="space-y-4 px-4 pb-8">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <StatCard value={stats?.openTickets ?? 0} label={t('admin.stat_open') ?? 'open tickets'} />
            <StatCard value={stats?.inProgressTickets ?? 0} label={t('admin.stat_in_progress') ?? 'tickets in progress'} />
            <StatCard value={stats?.avgResponseTime ?? '—'} label={t('admin.stat_avg_response') ?? 'avg response time'} />
            <StatCard value={stats?.resolvedRate ?? '—'} label={t('admin.stat_resolved') ?? 'tickets resolved'} />
          </div>
        )}

        <div>
          <p className="mb-1.5 px-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {t('admin.section_management') ?? 'Management'}
          </p>
          {isLoading ? (
            <div className="space-y-0 overflow-hidden rounded-xl border bg-card">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          ) : (
            <Card className="py-0">
              <CardContent className="p-0">
                {MGMT_ROUTES.map((item, i) => (
                  <div key={item.route}>
                    {i > 0 && <div className="mx-4 h-px bg-border" />}
                    <NavRow
                      icon={<item.icon className="h-4 w-4" />}
                      label={t(`admin.${item.key}`) ?? item.key}
                      onClick={() => { void navigate(item.route); }}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <p className="mb-1.5 px-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {t('admin.section_about') ?? 'About system'}
          </p>
          <Card className="py-0">
            <CardContent className="p-0">
              <InfoRow label="EasyDesk" value={BACKEND_VERSION} mono />
              <div className="mx-4 h-px bg-border" />
              <InfoRow label="Mini-App" value={APP_VERSION} mono />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

type StatCardProps = { value: string | number; label: string };

function StatCard({ value, label }: StatCardProps) {
  return (
    <Card className="py-0">
      <CardContent className="flex flex-col gap-1 p-4">
        <span className="text-xl font-bold">{value}</span>
        <span className="text-xs leading-tight text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}

type NavRowProps = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
};

function NavRow({ icon, label, onClick }: NavRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 active:bg-muted"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm">{label}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

