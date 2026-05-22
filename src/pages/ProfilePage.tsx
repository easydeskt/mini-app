import { type ReactNode } from 'react';

import { initData, useSignal } from '@telegram-apps/sdk-react';
import { ChevronRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router';

import { InfoRow } from '@/components/shared/InfoRow';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeSwitcher } from '@/components/kibo-ui/theme-switcher';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { usePreferences, type Language } from '@/context/PreferencesContext';
import { useBackButton } from '@/hooks/useBackButton';
import { useCurrentAgent } from '@/hooks/queries/useCurrentAgent';
import { useT } from '@/hooks/useT';
import type { AgentRole } from '@/types/agent';

export function ProfilePage() {
  const navigate = useNavigate();
  const tgUser = useSignal(initData.user);
  const { data: agent, isLoading } = useCurrentAgent();

  useBackButton();

  const { language, theme, setLanguage, setTheme } = usePreferences();
  const t = useT();

  const ROLE_LABEL: Record<AgentRole, string> = {
    ADMIN: t('profile.role_admin') ?? 'Administrator',
    OPERATOR: t('profile.role_operator') ?? 'Operator',
  };

  const photoUrl = tgUser?.photo_url;
  const noData = isLoading || !agent;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="space-y-4 p-4 pb-8">

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
              <InfoRow label={t('profile.field_telegram') ?? 'Telegram'} value={tgUser?.username ? `@${tgUser.username}` : undefined} mono skeletonWidth="w-36" />
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

        <div>
          <p className="mb-1.5 px-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {t('ui.preferences') ?? 'Preferences'}
          </p>
          <Card className="py-0">
            <CardContent className="p-0">
              <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                <span className="text-sm text-muted-foreground">{t('ui.language') ?? 'Language'}</span>
                <Select value={language} onValueChange={v => setLanguage(v as Language)}>
                  <SelectTrigger className="h-8 w-32 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ru">
                      <span className="flex items-center gap-2"><FlagRu />{t('ui.lang_ru') ?? 'Русский'}</span>
                    </SelectItem>
                    <SelectItem value="en">
                      <span className="flex items-center gap-2"><FlagUs />{t('ui.lang_en') ?? 'English'}</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mx-4 h-px bg-border" />
              <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                <span className="text-sm text-muted-foreground">{t('ui.theme') ?? 'Theme'}</span>
                <ThemeSwitcher value={theme} onChange={setTheme} />
              </div>
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

function FlagRu() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true" className="shrink-0 rounded-[2px]">
      <rect width="20" height="14" fill="#fff" />
      <rect y="4.67" width="20" height="4.67" fill="#0036A6" />
      <rect y="9.33" width="20" height="4.67" fill="#D52B1E" />
    </svg>
  );
}

function FlagUs() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true" className="shrink-0 rounded-[2px]">
      <rect width="20" height="14" fill="#B22234" />
      <rect y="1.08" width="20" height="1.08" fill="#fff" />
      <rect y="3.23" width="20" height="1.08" fill="#fff" />
      <rect y="5.38" width="20" height="1.08" fill="#fff" />
      <rect y="7.54" width="20" height="1.08" fill="#fff" />
      <rect y="9.69" width="20" height="1.08" fill="#fff" />
      <rect y="11.85" width="20" height="1.08" fill="#fff" />
      <rect width="8" height="7.54" fill="#3C3B6E" />
    </svg>
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
