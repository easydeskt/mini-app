import { useState } from 'react';

import { SiTelegram } from '@icons-pack/react-simple-icons';
import {
  ArrowLeft,
  Check,
  CircleQuestionMark,
  CircleX,
  ExternalLink,
  Flag,
  GitMerge,
  Headphones,
  MoreHorizontal,
  NotebookPen,
  Paperclip,
  RotateCcw,
  Tag,
  UserMinus,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';

import { ActivityLine } from '@/components/ticket/ActivityLine';
import { HistoryTimeline } from '@/components/ticket/HistoryTimeline';
import { NotesSection } from '@/components/ticket/NotesSection';
import { AssignAgentSheet } from '@/components/AssignAgentSheet';
import { MergeTicketSheet } from '@/components/MergeTicketSheet';
import { NoteEditSheet } from '@/components/NoteEditSheet';
import { PrioritySheet } from '@/components/PrioritySheet';
import { ResolveTicketSheet } from '@/components/ResolveTicketSheet';
import { TagsSheet } from '@/components/TagsSheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TagBadge } from '@/components/ui/tag-badge';
import { Button } from '@/components/ui/button';
import { PriorityBarsIcon } from '@/components/ui/priority-bars-icon';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { FetchError } from '@/components/ui/list-error';
import { Skeleton } from '@/components/ui/skeleton';
import { assignTicket, closeTicket, freeTicket, mergeTickets, reopenTicket, resolveTicket, setTicketAttributes, setTicketPriority, setTicketTags } from '@/api/tickets';
import { queryKeys } from '@/api/query-keys';
import { formatAttachmentCount } from '@/utils/formatters';
import { PRIORITY_TEXT_COLOR, SourceIcon } from '@/utils/ticketDisplay';
import { useTicket } from '@/hooks/queries/useTicket';
import { useAgent } from '@/hooks/queries/useAgent';
import { useBackButton } from '@/hooks/useBackButton';
import { useCurrentAgent } from '@/hooks/queries/useCurrentAgent';
import { useT } from '@/hooks/useT';
import type { TicketPriority } from '@/types/ticket';


export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const ticketId = Number(id);
  const navigate = useNavigate();
  const t = useT();
  useBackButton();

  const { data: ticket, isError, isLoading, refetch } = useTicket(ticketId);
  const { data: assignedAgent } = useAgent(ticket?.assignedAgentId ?? undefined);
  const { data: currentAgent } = useCurrentAgent();
  const queryClient = useQueryClient();
  const [noteSheetOpen, setNoteSheetOpen] = useState(false);
  const [prioritySheetOpen, setPrioritySheetOpen] = useState(false);
  const [tagsSheetOpen, setTagsSheetOpen] = useState(false);
  const [assignSheetOpen, setAssignSheetOpen] = useState(false);
  const [mergeSheetOpen, setMergeSheetOpen] = useState(false);
  const [resolveSheetOpen, setResolveSheetOpen] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(ticketId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
  };

  const assignMutation = useMutation({
    mutationFn: () => assignTicket(ticketId, currentAgent!.id),
    onSuccess: () => { invalidate(); toast.success(t('tickets.toast_assigned')); },
    onError: () => toast.error(t('tickets.toast_assign_error')),
  });

  const freeMutation = useMutation({
    mutationFn: () => freeTicket(ticketId),
    onSuccess: () => { invalidate(); toast.success(t('tickets.toast_freed')); },
    onError: () => toast.error(t('tickets.toast_free_error')),
  });

  const resolveMutation = useMutation({
    mutationFn: async (note: string | null) => {
      if (note) await setTicketAttributes(ticketId, { resolution_note: note });
      await resolveTicket(ticketId);
    },
    onSuccess: () => { invalidate(); toast.success(t('tickets.toast_resolved')); setResolveSheetOpen(false); },
    onError: () => toast.error(t('tickets.toast_resolve_error')),
  });

  const reopenMutation = useMutation({
    mutationFn: () => reopenTicket(ticketId),
    onSuccess: () => { invalidate(); toast.success(t('tickets.toast_reopened')); },
    onError: () => toast.error(t('tickets.toast_reopen_error')),
  });

  const assignToMutation = useMutation({
    mutationFn: (agentId: string) => assignTicket(ticketId, agentId),
    onSuccess: () => { invalidate(); toast.success(t('tickets.toast_agent_assigned')); },
    onError: () => toast.error(t('tickets.toast_agent_assign_error')),
  });

  const setPriorityMutation = useMutation({
    mutationFn: (priority: string | null) => setTicketPriority(ticketId, priority),
    onSuccess: () => { invalidate(); toast.success(t('tickets.toast_priority_updated')); setPrioritySheetOpen(false); },
    onError: () => toast.error(t('tickets.toast_priority_error')),
  });

  const setTagsMutation = useMutation({
    mutationFn: (tagIds: number[]) => setTicketTags(ticketId, tagIds),
    onSuccess: () => { invalidate(); toast.success(t('tickets.toast_tags_updated')); setTagsSheetOpen(false); },
    onError: () => toast.error(t('tickets.toast_tags_error')),
  });

  const mergeMutation = useMutation({
    mutationFn: (targetId: number) => mergeTickets(ticketId, targetId),
    onSuccess: () => { invalidate(); toast.success(t('tickets.toast_merged')); },
    onError: () => toast.error(t('tickets.toast_merge_error')),
  });

  const closeMutation = useMutation({
    mutationFn: () => closeTicket(ticketId),
    onSuccess: () => { invalidate(); toast.success(t('tickets.toast_closed')); },
    onError: () => toast.error(t('tickets.toast_close_error')),
  });

  const isAssignedToMe = !!currentAgent && ticket?.assignedAgentId === currentAgent.id;
  const hasActionBar = !isLoading && !isError && !!ticket;

  const PRIORITY_LABEL: Record<TicketPriority, string> = {
    HIGH: t('tickets.priority_high'),
    LOW: t('tickets.priority_low'),
    MEDIUM: t('tickets.priority_medium'),
  };

  return (
    <div className="flex h-dvh flex-col bg-background">
      {dropdownOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 transition-opacity" />
      )}

      <div className="shrink-0 z-10 flex items-center gap-2 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-md">
        <button
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background"
          onClick={() => void navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        {isLoading ? (
          <Skeleton className="mx-auto h-4 w-16" />
        ) : (
          <h1 className="flex-1 text-center text-base font-semibold tracking-[-0.2px]">
            {ticket ? `${t('tickets.detail_title_prefix')}${ticket.id}` : t('tickets.detail_unknown')}
          </h1>
        )}
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-52" sideOffset={24}>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setPrioritySheetOpen(true)}>
                <Flag />
                {t('tickets.action_change_priority')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTagsSheetOpen(true)}>
                <Tag />
                {t('tickets.action_change_tags')}
              </DropdownMenuItem>
            </DropdownMenuGroup>

            {ticket?.status !== 'MERGED' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setAssignSheetOpen(true)}>
                    <UserPlus />
                    {t('tickets.action_assign_agent')}
                  </DropdownMenuItem>
                  {isAssignedToMe && (
                    <DropdownMenuItem onClick={() => freeMutation.mutate()}>
                      <UserMinus />
                      {t('tickets.ticket_detail_action_free')}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setNoteSheetOpen(true)}>
                <NotebookPen />
                {t('tickets.action_add_note')}
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive" onClick={() => setMergeSheetOpen(true)}>
                <GitMerge />
                {t('tickets.action_merge')}
              </DropdownMenuItem>
              {(ticket?.status === 'OPEN' || ticket?.status === 'IN_PROGRESS') && (
                <DropdownMenuItem variant="destructive" onClick={() => setCloseConfirmOpen(true)}>
                  <CircleX />
                  {t('tickets.action_close_ticket')}
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3 px-4 pb-4 pt-4">
        {isLoading && (
          <>
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </>
        )}

        {!isLoading && isError && (
          <FetchError
            description={t('tickets.ticket_detail_load_error')}
            onRetry={refetch}
          />
        )}

        {!isLoading && !isError && ticket && (
          <>
            {/* Summary card */}
            <div className="rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="p-3.5">
                <div className="mb-3 flex flex-wrap items-center gap-1.5">
                  {ticket.priority != null ? (
                    <span className={`inline-flex items-center gap-1.5 rounded-md border border-border px-2 text-[11px] font-semibold ${PRIORITY_TEXT_COLOR[ticket.priority]}`}>
                      <PriorityBarsIcon priority={ticket.priority} />
                      {PRIORITY_LABEL[ticket.priority]} {t('tickets.detail_priority_suffix')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 text-[11px] font-semibold text-zinc-400">
                      <CircleQuestionMark className="h-3 w-3" />
                      {t('tickets.detail_no_priority')}
                    </span>
                  )}
                  {ticket.attachmentCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 text-[11px] font-semibold text-muted-foreground">
                      <Paperclip className="h-3 w-3" />
                      {formatAttachmentCount(ticket.attachmentCount)}
                    </span>
                  )}
                </div>

                {ticket.messagePreview && (
                  <p className="mb-3 line-clamp-7 text-[15.5px] leading-5.25">{ticket.messagePreview}</p>
                )}

                {ticket.tags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {ticket.tags.map(tag => (
                      <TagBadge key={tag.id} color={tag.color} name={tag.name} />
                    ))}
                  </div>
                )}

                <Separator className="mb-2.5" />
                <ActivityLine ticket={ticket} agentName={assignedAgent?.name ?? null} />
              </div>
            </div>

            {/* Resolution card */}
            {ticket.resolutionNote && (
              <Card className="py-0">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                    <div>
                      <p className="mb-1 text-sm font-semibold">{t('tickets.detail_section_resolution')}</p>
                      <p className="text-sm text-muted-foreground">{ticket.resolutionNote}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes section */}
            {ticket.notes.length > 0 && (
              <NotesSection notes={ticket.notes} ticketId={ticket.id} />
            )}

            {/* Details section */}
            <div>
              <p className="mb-1.5 px-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {t('tickets.detail_section_details')}
              </p>
              <Card className="py-0">
                <CardContent className="p-0">
                  {ticket.clientName && (
                    <>
                      <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                        <span className="text-sm text-muted-foreground">{t('tickets.detail_field_client')}</span>
                        <div className="flex items-center gap-1.5">
                          {ticket.clientUrl && <ExternalLink className="h-3.5 w-3.5 shrink-0" />}
                          {ticket.clientUrl
                            ? <a href={ticket.clientUrl} target="_blank" rel="noreferrer" className="text-sm">{ticket.clientName}</a>
                            : <span className="text-sm">{ticket.clientName}</span>
                          }
                        </div>
                      </div>
                      <div className="mx-4 h-px bg-border" />
                    </>
                  )}
                  {ticket.channelName && ticket.sourceType && (
                    <>
                      <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                        <span className="text-sm text-muted-foreground">{t('tickets.detail_field_channel')}</span>
                        <div className="flex items-center gap-1.5">
                          <SourceIcon type={ticket.sourceType} className="h-3.5 w-3.5 shrink-0" />
                          <span className="text-sm">{ticket.channelName}</span>
                        </div>
                      </div>
                      <div className="mx-4 h-px bg-border" />
                    </>
                  )}
                  <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                    <span className="text-sm text-muted-foreground">{t('tickets.ticket_detail_field_agent')}</span>
                    {assignedAgent ? (
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="bg-zinc-200 text-[9px] font-semibold dark:bg-zinc-700">
                            {assignedAgent.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{assignedAgent.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {t('tickets.ticket_detail_no_agent')}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* History section */}
            <div>
              <p className="mb-1.5 px-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {t('tickets.detail_section_history')}
              </p>
              <Card className="py-0">
                <CardContent className="px-4 py-3">
                  <HistoryTimeline ticket={ticket} agentName={assignedAgent?.name ?? null} />
                </CardContent>
              </Card>
            </div>

          </>
        )}
        </div>
      </div>

      {/* Bottom action bar */}
      {hasActionBar && (
        <div className="shrink-0 space-y-3 border-t border-border bg-background p-4">
          {ticket!.status === 'OPEN' && (
            <Button
              variant="outline"
              className="h-12 w-full rounded-xl text-[14px]"
              disabled={assignMutation.isPending || !currentAgent}
              onClick={() => assignMutation.mutate()}
            >
              <Headphones className="h-4 w-4" />
              {t('tickets.ticket_detail_action_assign')}
            </Button>
          )}
          {ticket!.status === 'IN_PROGRESS' && (
            <Button
              variant="outline"
              className="h-12 w-full rounded-xl text-[14px]"
              disabled={resolveMutation.isPending}
              onClick={() => setResolveSheetOpen(true)}
            >
              <Check className="h-4 w-4" />
              {t('tickets.ticket_detail_action_resolve')}
            </Button>
          )}
          {(ticket!.status === 'RESOLVED' || ticket!.status === 'CLOSED') && (
            <Button
              variant="outline"
              className="h-12 w-full rounded-xl text-[14px]"
              disabled={reopenMutation.isPending}
              onClick={() => reopenMutation.mutate()}
            >
              <RotateCcw className="h-4 w-4" />
              {t('tickets.ticket_detail_action_reopen')}
            </Button>
          )}

          {ticket!.topicUrl ? (
            <a
              href={ticket!.topicUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 text-[14px] font-medium text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              <SiTelegram className="h-4 w-4" />
              {t('tickets.ticket_detail_open_in_telegram')}
            </a>
          ) : (
            <button
              type="button"
              aria-disabled="true"
              className="pointer-events-none flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-200 text-[14px] font-medium text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
            >
              <SiTelegram className="h-4 w-4" />
              {t('tickets.ticket_detail_open_in_telegram')}
            </button>
          )}
        </div>
      )}

      <NoteEditSheet
        ticketId={ticketId}
        open={noteSheetOpen}
        onOpenChange={setNoteSheetOpen}
      />

      {ticket && (
        <>
          <PrioritySheet
            currentPriority={ticket.priority}
            isPending={setPriorityMutation.isPending}
            open={prioritySheetOpen}
            onOpenChange={setPrioritySheetOpen}
            onSave={(p) => setPriorityMutation.mutate(p)}
          />
          <TagsSheet
            currentTags={ticket.tags}
            isPending={setTagsMutation.isPending}
            open={tagsSheetOpen}
            onOpenChange={setTagsSheetOpen}
            onSave={(ids) => setTagsMutation.mutate(ids)}
          />
          <AssignAgentSheet
            currentAgentId={ticket.assignedAgentId}
            isPending={assignToMutation.isPending}
            open={assignSheetOpen}
            onAssign={(id) => assignToMutation.mutate(id)}
            onOpenChange={setAssignSheetOpen}
          />
          <MergeTicketSheet
            ticket={ticket}
            isPending={mergeMutation.isPending}
            open={mergeSheetOpen}
            onMerge={(id) => mergeMutation.mutate(id)}
            onOpenChange={setMergeSheetOpen}
          />
          <ResolveTicketSheet
            isPending={resolveMutation.isPending}
            open={resolveSheetOpen}
            onOpenChange={setResolveSheetOpen}
            onResolve={(note) => resolveMutation.mutate(note)}
          />
          <AlertDialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>{t('tickets.close_confirm_title')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('tickets.detail_title_prefix')}{ticket.id} {t('tickets.close_confirm_description')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('tickets.close_confirm_cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={closeMutation.isPending}
                  onClick={() => closeMutation.mutate()}
                >
                  {t('tickets.close_confirm_ok')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}


