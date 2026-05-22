import { Fragment, useState } from 'react';

import { GitMerge } from 'lucide-react';

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
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useT } from '@/hooks/useT';
import { useTickets } from '@/hooks/queries/useTickets';
import { formatRelativeTime } from '@/utils/formatters';
import { STATUS_DOT } from '@/utils/ticketDisplay';
import type { Ticket } from '@/types/ticket';

type MergeTicketSheetProps = {
  isPending: boolean;
  open: boolean;
  ticket: Ticket;
  onMerge: (targetId: number) => void;
  onOpenChange: (open: boolean) => void;
};


export function MergeTicketSheet({ isPending, open, ticket, onMerge, onOpenChange }: MergeTicketSheetProps) {
  const t = useT();
  const { data: allTickets, isLoading } = useTickets();
  const [confirmTarget, setConfirmTarget] = useState<Ticket | null>(null);

  const STATUS_LABEL: Partial<Record<string, string>> = {
    CLOSED: t('tickets.status_closed'),
    IN_PROGRESS: t('tickets.status_in_progress'),
    OPEN: t('tickets.status_open'),
    RESOLVED: t('tickets.status_resolved'),
  };

  const candidates = allTickets.filter(c =>
    c.id !== ticket.id &&
    c.clientName === ticket.clientName &&
    c.sourceType === ticket.sourceType &&
    c.status !== 'MERGED'
  );

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-xl gap-1" showCloseButton={false}>
          <SheetHeader className="flex-row items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-base">
              <GitMerge className="h-5 w-5 shrink-0" />
              {t('tickets.merge_sheet_title')}
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col px-4 pb-4">
            {!isLoading && candidates.length > 0 && (
              <p className="mb-3 px-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {t('tickets.merge_select')}
              </p>
            )}
            {isLoading ? (
              <div className="rounded-lg border py-6 text-center text-sm text-muted-foreground">{t('tickets.merge_loading')}</div>
            ) : candidates.length === 0 ? (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <GitMerge />
                  </EmptyMedia>
                  <EmptyTitle>{t('tickets.merge_empty_title')}</EmptyTitle>
                  <EmptyDescription>
                    {t('tickets.merge_empty_description')}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="overflow-hidden rounded-lg border">
                {candidates.map((candidate, idx) => (
                  <Fragment key={candidate.id}>
                    {idx > 0 && <div className="h-px bg-border" />}
                    <button
                      type="button"
                      className="flex w-full flex-col gap-1 px-4 py-3 text-left outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted active:bg-muted"
                      onClick={() => setConfirmTarget(candidate)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">#{candidate.id}</span>
                        <span className="text-xs text-muted-foreground/50">•</span>
                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-1.75 text-[11px] font-medium text-foreground">
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[candidate.status]}`} />
                          {STATUS_LABEL[candidate.status] ?? candidate.status}
                        </span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {formatRelativeTime(candidate.lastMessageAt)}
                        </span>
                      </div>
                      {candidate.messagePreview && (
                        <p className="line-clamp-2 text-xs text-muted-foreground">{candidate.messagePreview}</p>
                      )}
                    </button>
                  </Fragment>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!confirmTarget} onOpenChange={(o) => { if (!o) setConfirmTarget(null); }}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('tickets.merge_confirm_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('tickets.detail_title_prefix')}{ticket.id} {'→'} #{confirmTarget?.id}. {t('notes.delete_confirm_description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('tickets.merge_confirm_cancel')}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={() => {
                if (confirmTarget) {
                  onMerge(confirmTarget.id);
                  setConfirmTarget(null);
                  onOpenChange(false);
                }
              }}
            >
              {t('tickets.merge_confirm_ok')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
