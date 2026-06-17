import { type ReactNode, useEffect, useState } from 'react';

import { ChevronRight, KeyRound, MessageCircleMore, MonitorSmartphone, Tag, Users } from 'lucide-react';
import { useNavigate } from 'react-router';

import { InfoRow } from '@/components/shared/InfoRow';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAgents } from '@/hooks/queries/useAgents';
import { useChannels } from '@/hooks/queries/useChannels';
import { useTags } from '@/hooks/queries/useTags';
import { useTemplates } from '@/hooks/queries/useTemplates';
import { useSecrets } from '@/hooks/queries/useVault';
import { useWorkspace } from '@/hooks/queries/useWorkspace';
import { useBackButton } from '@/hooks/useBackButton';
import { useT } from '@/hooks/useT';
import { formatAvgResponseTime, formatUptime, pluralizeRu, type DurationUnits } from '@/utils/formatters';

const APP_VERSION = import.meta.env.VITE_APP_VERSION;

const MGMT_ROUTES = [
  { icon: Users, key: 'nav_agents', route: '/admin/agents', skeletonWidth: 'w-24' },
  { icon: Tag, key: 'nav_tags', route: '/admin/tags', skeletonWidth: 'w-16' },
  { icon: MessageCircleMore, key: 'nav_templates', route: '/admin/templates', skeletonWidth: 'w-28' },
  { icon: MonitorSmartphone, key: 'nav_channels', route: '/admin/channels', skeletonWidth: 'w-20' },
  { icon: KeyRound, key: 'nav_vault', route: '/admin/vault', skeletonWidth: 'w-24' },
] as const;

type NavKey = (typeof MGMT_ROUTES)[number]['key'];

export function AdminPage() {
  const navigate = useNavigate();
  const { data: workspace, isLoading: workspaceLoading } = useWorkspace();
  const { data: agents, isLoading: agentsLoading } = useAgents();
  const { data: tags, isLoading: tagsLoading } = useTags();
  const { data: templates, isLoading: templatesLoading } = useTemplates();
  const { data: channels, isLoading: channelsLoading } = useChannels();
  const { data: secrets, isLoading: secretsLoading } = useSecrets();
  const t = useT();

  useBackButton();

  const units: DurationUnits = {
    days: t('time.days'),
    hours: t('time.hours'),
    lessThanMinute: t('time.less_than_minute'),
    minutes: t('time.minutes'),
  };

  const [uptime, setUptime] = useState('');
  useEffect(() => {
    if (!workspace?.started_at) return;
    const update = () => setUptime(formatUptime(workspace.started_at, units));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [workspace?.started_at, units.days, units.hours, units.minutes, units.lessThanMinute]);

  const isLoading = workspaceLoading;

  const counters = workspace?.metrics.tickets_counters;
  const total = counters ? counters.open + counters.in_progress + counters.resolved + counters.closed : 0;
  const resolvedRate = counters && total > 0 ? `${Math.round((counters.resolved / total) * 100)}%` : '—';
  const avgResponse = workspace ? formatAvgResponseTime(workspace.metrics.avg_response_time, units) : '—';

  const sublabels: Record<NavKey, string | undefined> = {
    nav_agents: agentsLoading ? undefined : agents.length === 0
      ? t('admin.nav_agents_empty')
      : pluralizeRu(agents.length, t('agents.count_one'), t('agents.count_few'), t('agents.count_many')),
    nav_tags: tagsLoading ? undefined : tags.length === 0
      ? t('admin.nav_tags_empty')
      : pluralizeRu(tags.length, t('tags.count_one'), t('tags.count_few'), t('tags.count_many')),
    nav_templates: templatesLoading ? undefined : templates.length === 0
      ? t('admin.nav_templates_empty')
      : pluralizeRu(templates.length, t('templates.count_one'), t('templates.count_few'), t('templates.count_many')),
    nav_channels: channelsLoading ? undefined : channels.length === 0
      ? t('admin.nav_channels_empty')
      : pluralizeRu(channels.length, t('channels.count_one'), t('channels.count_few'), t('channels.count_many')),
    nav_vault: secretsLoading ? undefined : secrets.length === 0
      ? t('admin.nav_vault_empty')
      : pluralizeRu(secrets.length, t('vault.count_one'), t('vault.count_few'), t('vault.count_many')),
  };

  const sublabelLoadings: Record<NavKey, boolean> = {
    nav_agents: agentsLoading,
    nav_channels: channelsLoading,
    nav_tags: tagsLoading,
    nav_templates: templatesLoading,
    nav_vault: secretsLoading,
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="mx-auto w-full max-w-120 space-y-4 px-4 pb-8 pt-4">
        <div>
          {isLoading ? (
            <Skeleton className="h-8 w-40" />
          ) : (
            <h1 className="text-2xl font-bold tracking-tight">{workspace?.name ?? 'EasyDesk'}</h1>
          )}
          <p className="mt-0.5 text-sm text-muted-foreground">{t('admin.page_title') ?? 'Workspace management'}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StatCard loading={isLoading} value={counters?.open ?? 0} label={t('admin.stat_open') ?? 'open tickets'} />
          <StatCard loading={isLoading} value={counters?.in_progress ?? 0} label={t('admin.stat_in_progress') ?? 'tickets in progress'} />
          <StatCard loading={isLoading} value={avgResponse} label={t('admin.stat_avg_response') ?? 'avg response time'} />
          <StatCard loading={isLoading} value={resolvedRate} label={t('admin.stat_resolved') ?? 'tickets resolved'} />
        </div>

        <div>
          <p className="mb-1.5 px-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {t('admin.section_management') ?? 'Management'}
          </p>
          <Card className="py-0">
            <CardContent className="p-0">
              {MGMT_ROUTES.map((item, i) => (
                <div key={item.route}>
                  {i > 0 && <div className="mx-4 h-px bg-border" />}
                  <NavRow
                    icon={<item.icon className="h-4 w-4" />}
                    label={t(`admin.${item.key}`) ?? item.key}
                    sublabel={sublabels[item.key]}
                    sublabelLoading={sublabelLoadings[item.key]}
                    sublabelSkeletonWidth={item.skeletonWidth}
                    onClick={() => { void navigate(item.route); }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div>
          <p className="mb-1.5 px-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {t('admin.section_about') ?? 'About system'}
          </p>
          <Card className="py-0">
            <CardContent className="p-0">
              <InfoRow label="EasyDesk" value={workspace?.version ?? '—'} loading={workspaceLoading} mono unset={!workspace?.version} />
              <div className="mx-4 h-px bg-border" />
              <InfoRow label="Mini-App" value={APP_VERSION} mono />
              <div className="mx-4 h-px bg-border" />
              <InfoRow label={t('admin.about_uptime') ?? 'Uptime'} value={uptime || '—'} loading={workspaceLoading} unset={!uptime} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-8 bg-linear-to-t from-background to-transparent" />
    </div>
  );
}

type StatCardProps = { label: string; loading?: boolean; value: string | number };

function StatCard({ label, loading, value }: StatCardProps) {
  return (
    <Card className="py-0">
      <CardContent className="flex flex-col gap-1 p-4">
        {loading ? (
          <Skeleton className="h-7 w-10" />
        ) : (
          <span className="text-xl font-bold">{value}</span>
        )}
        <span className="text-xs leading-tight text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}

type NavRowProps = {
  icon: ReactNode;
  label: string;
  sublabel?: string;
  sublabelLoading?: boolean;
  sublabelSkeletonWidth?: string;
  onClick: () => void;
};

function NavRow({ icon, label, sublabel, sublabelLoading, sublabelSkeletonWidth = 'w-20', onClick }: NavRowProps) {
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
        {sublabelLoading ? (
          <Skeleton className={`mt-0.5 h-3 ${sublabelSkeletonWidth}`} />
        ) : sublabel !== undefined ? (
          <span className="block text-xs text-muted-foreground">{sublabel}</span>
        ) : null}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

