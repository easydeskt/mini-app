import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { initData, useSignal } from '@telegram-apps/sdk-react';
import { ArrowUp, CircleQuestionMark, Inbox, Search, SearchX, SlidersHorizontal, UserRound, X } from 'lucide-react';
import { useNavigate } from 'react-router';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PriorityBarsIcon } from '@/components/ui/priority-bars-icon';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { FetchError } from '@/components/ui/list-error';
import { TagBadge } from '@/components/ui/tag-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTickets } from '@/hooks/queries/useTickets';
import { formatRelativeTime } from '@/utils/formatters';
import { getInitials } from '@/utils/initials';
import { PRIORITY_ICON_BG, SourceIcon, STATUS_DOT } from '@/utils/ticketDisplay';
import { ApiError } from '@/api/client';
import { ErrorScreen } from '@/components/ErrorScreen';
import { useAgents } from '@/hooks/queries/useAgents';
import { useCurrentAgent } from '@/hooks/queries/useCurrentAgent';
import { useLang } from '@/hooks/useLang';
import { useT } from '@/hooks/useT';
import { useWorkspace } from '@/hooks/queries/useWorkspace';
import type { Agent } from '@/types/agent';
import type { Ticket, TicketFilter, TicketStatus } from '@/types/ticket';

const FILTER_IDS: TicketFilter[] = ['all', 'mine', 'unassigned'];

const FILTER_STATUS: Partial<Record<TicketFilter, TicketStatus>> = {
  open: 'OPEN',
  progress: 'IN_PROGRESS',
  resolved: 'RESOLVED',
};


function formatPillCount(n: number): string {
  return n > 99 ? '99+' : String(n);
}

export function TicketListPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<TicketFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const tgUser = useSignal(initData.user);
  const { data: agent, error: agentError, isLoading: agentLoading } = useCurrentAgent();
  const { data: agents } = useAgents();
  const { data: workspace } = useWorkspace();
  const { data: tickets, isError: ticketsError, isLoading: ticketsLoading, refetch: refetchTickets, error: ticketsFetchError } = useTickets();
  const t = useT();

  const agentMap = useMemo<Record<string, Agent>>(
    () => Object.fromEntries(agents.map(a => [a.id, a])),
    [agents],
  );

  const unreadByFilter = useMemo(() => {
    const agentId = agent?.id ?? null;
    return {
      all: tickets.filter(tk => tk.unreadCount > 0).length,
      mine: tickets.filter(tk => tk.assignedAgentId === agentId && tk.unreadCount > 0).length,
      unassigned: tickets.filter(tk => tk.assignedAgentId === null && tk.unreadCount > 0).length,
    };
  }, [tickets, agent?.id]);

  const FILTERS: { id: TicketFilter; label: string; unread: number }[] = [
    { id: 'all', label: t('tickets.filter_all'), unread: unreadByFilter.all },
    { id: 'mine', label: t('tickets.filter_mine'), unread: unreadByFilter.mine },
    { id: 'unassigned', label: t('tickets.filter_free'), unread: unreadByFilter.unassigned },
  ];

  const isLoading = agentLoading || ticketsLoading;

  const avatarNoData = !tgUser && (agentLoading || !agent);
  const initials = tgUser
    ? getInitials(`${tgUser.first_name}${tgUser.last_name ? ' ' + tgUser.last_name : ''}`)
    : agent
      ? getInitials(agent.name)
      : '?';
  const photoUrl = tgUser?.photo_url;

  const filteredTickets = tickets.filter((ticket) => {
    if (activeFilter === 'mine' && ticket.assignedAgentId !== (agent?.id ?? null)) return false;
    if (activeFilter === 'unassigned' && ticket.assignedAgentId !== null) return false;
    const statusFilter = FILTER_STATUS[activeFilter];
    if (statusFilter && ticket.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        String(ticket.id).includes(q) ||
        (ticket.clientName?.toLowerCase().includes(q) ?? false) ||
        ticket.tags.some(tag => tag.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const withUnread = filteredTickets.filter(tk => tk.unreadCount > 0);
  const others = filteredTickets.filter(tk => tk.unreadCount === 0);
  const hasUnreadGroup = withUnread.length > 0;

  const showControls = !isLoading && !ticketsError && tickets.length > 0;

  function resetFilters() {
    setSearchQuery('');
    setActiveFilter('all');
  }

  const openCount = workspace?.metrics.tickets_counters.open ?? 0;

  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 200);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const touchX = useRef<number | null>(null);
  const touchY = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX;
    touchY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchX.current === null || touchY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    const dy = e.changedTouches[0].clientY - touchY.current;
    touchX.current = null;
    touchY.current = null;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    const idx = FILTER_IDS.indexOf(activeFilter);
    if (dx < 0 && idx < FILTER_IDS.length - 1) setActiveFilter(FILTER_IDS[idx + 1]);
    else if (dx > 0 && idx > 0) setActiveFilter(FILTER_IDS[idx - 1]);
  }

  if (!agentLoading && agentError instanceof ApiError && agentError.status === 401) {
    return <ErrorScreen title={t('common.access_denied')} />;
  }

  return (
    <div className="touch-pan-y flex min-h-dvh flex-col bg-background" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-120 px-4 py-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('tickets.page_title')}
              {!isLoading && tickets.length > 0 && (
                <span className="font-normal text-muted-foreground"> • {openCount} {t('tickets.stats_active')}</span>
              )}
            </h1>
          </div>
          <div>
            <button onClick={() => { void navigate('/agents/me'); }}>
              {avatarNoData ? (
                <Skeleton className="h-9 w-9 rounded-full" />
              ) : (
                <Avatar className="h-9 w-9">
                  {photoUrl && <AvatarImage src={photoUrl} />}
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              )}
            </button>
          </div>
        </div>
        </div>
      </div>

      {showControls && (
        <div className="mx-auto w-full max-w-120 px-4 pb-2 pt-2">
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('tickets.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl bg-background pl-10 pr-10"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={t('common.clear_search')}
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <SlidersHorizontal className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              )}
            </div>

            <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as TicketFilter)}>
              <TabsList className="w-full">
                {FILTERS.map((f) => (
                  <TabsTrigger key={f.id} value={f.id} className="flex-auto">
                    <span className="flex items-center gap-1.5">
                      {f.label}
                      {f.unread > 0 && (
                        <span className="inline-flex items-center rounded-full bg-zinc-900 px-2 py-0.5 text-[11px] font-semibold leading-none text-white dark:bg-white dark:text-zinc-900">
                          {formatPillCount(f.unread)}
                        </span>
                      )}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="mx-auto w-full max-w-120 space-y-2 px-4 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <TicketSkeleton key={i} />
          ))}
        </div>
      )}

      {!isLoading && ticketsError && (
        <FetchError
          description={t('tickets.load_error')}
          onRetry={refetchTickets}
          error={ticketsFetchError}
        />
      )}

      {!isLoading && !ticketsError && tickets.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox />
            </EmptyMedia>
            <EmptyTitle>{t('tickets.empty_title')}</EmptyTitle>
            <EmptyDescription>{t('tickets.empty_description')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {!isLoading && !ticketsError && tickets.length > 0 && filteredTickets.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX />
            </EmptyMedia>
            <EmptyTitle>{t('tickets.no_results_title')}</EmptyTitle>
            <EmptyDescription>{t('tickets.no_results_description')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={resetFilters} className="rounded-full">
              {t('tickets.clear_filters')}
            </Button>
          </EmptyContent>
        </Empty>
      )}

      {!isLoading && !ticketsError && filteredTickets.length > 0 && (
        <div className="mx-auto w-full max-w-120 space-y-2 px-4 pb-4 pt-1">
          {hasUnreadGroup && (
            <>
              <TicketGroupHeader
                label={t('tickets.group_with_unread')}
                count={withUnread.length}
              />
              {withUnread.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  agentMap={agentMap}
                  ticket={ticket}
                  onClick={() => { void navigate(`/tickets/${ticket.id}`); }}
                />
              ))}
            </>
          )}

          {others.length > 0 && (
            <>
              <TicketGroupHeader
                label={
                  hasUnreadGroup
                    ? t('tickets.group_others')
                    : t('tickets.group_all')
                }
                count={others.length}
                className={hasUnreadGroup ? 'mt-2' : ''}
              />
              {others.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  agentMap={agentMap}
                  ticket={ticket}
                  onClick={() => { void navigate(`/tickets/${ticket.id}`); }}
                />
              ))}
            </>
          )}
        </div>
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-8 bg-linear-to-t from-background to-transparent" />

      <button
        type="button"
        aria-label={t('common.scroll_to_top')}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-10 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-zinc-50 shadow-lg transition-all duration-300 dark:bg-zinc-50 dark:text-zinc-900 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </div>
  );
}

type TicketGroupHeaderProps = { label: string; count: number; className?: string };

function TicketGroupHeader({ className = '', count, label }: TicketGroupHeaderProps) {
  return (
    <div className={`flex items-center gap-1.5 pb-0.5 pl-4 pt-2 ${className}`}>
      <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="text-xs text-muted-foreground/40">•</span>
      <span className="text-xs font-medium text-muted-foreground/60">{count}</span>
    </div>
  );
}

function TicketSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3.5 shadow-sm space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-7 w-7 rounded-lg" />
        <Skeleton className="h-3.5 w-16" />
        <span className="flex-1" />
        <Skeleton className="h-3 w-10" />
      </div>
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-4/5" />
      <div className="flex items-center gap-1.5">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
    </div>
  );
}

type TicketCardProps = { ticket: Ticket; agentMap: Record<string, Agent>; onClick: () => void };

function TicketCard({ agentMap, ticket, onClick }: TicketCardProps) {
  const t = useT();
  const lang = useLang();

  const STATUS_LABEL: Record<TicketStatus, string> = {
    CLOSED: t('tickets.status_closed'),
    IN_PROGRESS: t('tickets.status_in_progress'),
    MERGED: t('tickets.status_merged'),
    OPEN: t('tickets.status_open'),
    RESOLVED: t('tickets.status_resolved'),
  };

  const time = formatRelativeTime(ticket.lastMessageAt, lang);
  const assignedAgent = ticket.assignedAgentId ? (agentMap[ticket.assignedAgentId] ?? null) : null;

  const tagsWrapperRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(ticket.tags.length);

  const prevTagCountRef = useRef(ticket.tags.length);
  if (prevTagCountRef.current !== ticket.tags.length) {
    prevTagCountRef.current = ticket.tags.length;
    setVisibleCount(ticket.tags.length);
  }

  useLayoutEffect(() => {
    if (visibleCount !== ticket.tags.length) return;
    const wrapper = tagsWrapperRef.current;
    const inner = wrapper?.firstElementChild as HTMLElement | null;
    if (!wrapper || !inner) return;
    const available = wrapper.clientWidth;
    if (inner.offsetWidth <= available) return;
    const kids = Array.from(inner.children) as HTMLElement[];
    const innerLeft = inner.getBoundingClientRect().left;
    const RESERVE = 42; // flex gap + "+N" badge
    let count = 0;
    for (let k = 1; k < ticket.tags.length; k++) {
      const lastTag = kids[k];
      if (!lastTag) break;
      const right = lastTag.getBoundingClientRect().right - innerLeft;
      if (right + RESERVE <= available) count = k;
      else break;
    }
    setVisibleCount(count);
  });

  const visibleTags = ticket.tags.slice(0, visibleCount);
  const extraTags = ticket.tags.length - visibleCount;

  return (
    <div
      className={`cursor-pointer rounded-xl border border-border bg-background px-4 py-3.5 shadow-sm transition-opacity active:opacity-75 ${ticket.status === 'CLOSED' || ticket.status === 'MERGED' ? 'opacity-50 hover:opacity-75' : ''}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="mb-1.5 flex items-center gap-2">
        {ticket.priority !== null ? (
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${PRIORITY_ICON_BG[ticket.priority]}`}>
            <PriorityBarsIcon priority={ticket.priority} />
          </span>
        ) : (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <CircleQuestionMark className="h-3.5 w-3.5 text-zinc-400" />
          </span>
        )}
        <span className="text-xs font-medium">#{ticket.id}</span>
        <span className="text-xs text-muted-foreground/50">•</span>
        <span className="inline-flex min-w-0 flex-1 items-center gap-1.5">
          {ticket.sourceType && <span className="inline-flex shrink-0 items-center"><SourceIcon type={ticket.sourceType} className="h-3 w-3 text-muted-foreground" /></span>}
          {ticket.clientName && (
            <span className="min-w-0 truncate text-xs text-muted-foreground">{ticket.clientName}</span>
          )}
          {ticket.unreadCount > 0 && (
            <span className="pill-unread shrink-0 rounded-full px-2 py-1 text-[11px] font-bold leading-none">
              +{ticket.unreadCount}
            </span>
          )}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground/70">{time}</span>
      </div>

      {ticket.messagePreview && (
        <p className="mb-2 line-clamp-2 text-sm leading-snug">
          {ticket.messagePreview}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <div ref={tagsWrapperRef} className="min-w-0 flex-1 overflow-hidden">
          <div className="flex w-max items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-1.75 text-[11px] font-medium text-foreground">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[ticket.status]}`} />
              {STATUS_LABEL[ticket.status]}
            </span>
            {visibleTags.map((tag) => (
              <TagBadge key={tag.id} color={tag.color} name={tag.name} />
            ))}
            {extraTags > 0 && (
              <span className="inline-flex items-center rounded-md bg-zinc-100 px-1.75 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                +{extraTags}
              </span>
            )}
          </div>
        </div>

        {assignedAgent ? (
          <div className="flex shrink-0 items-center gap-1">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="bg-zinc-200 text-[9px] font-semibold dark:bg-zinc-600">
                {assignedAgent.initials}
              </AvatarFallback>
            </Avatar>
            <span className="max-w-18 truncate text-xs text-muted-foreground">
              {assignedAgent.name.split(' ')[0]}
            </span>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-1 text-muted-foreground">
            <UserRound className="h-3.5 w-3.5" />
            <span className="text-xs">{t('tickets.ticket_detail_no_agent')}</span>
          </div>
        )}
      </div>
    </div>
  );
}

