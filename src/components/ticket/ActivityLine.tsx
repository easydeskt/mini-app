import type { ReactNode } from 'react';

import { Check, Clock, GitMerge, Headphones, X } from 'lucide-react';

import { withAgent } from '@/components/ticket/ticketHelpers';
import { useLang } from '@/hooks/useLang';
import { useT } from '@/hooks/useT';
import type { Ticket } from '@/types/ticket';
import { formatRelativeTime } from '@/utils/formatters';

type ActivityLineProps = {
  agentName: string | null;
  ticket: Ticket;
};

export function ActivityLine({ ticket, agentName }: ActivityLineProps) {
  const t = useT();
  const lang = useLang();
  type Line = { icon: ReactNode; label: ReactNode; time?: string | null };

  const line = ((): Line => {
    switch (ticket.status) {
      case 'OPEN': return {
        icon: <Clock className="h-3.5 w-3.5 shrink-0 text-blue-500" />,
        label: <span className="text-blue-500">{t('tickets.status_awaiting_reply')}</span>,
      };
      case 'IN_PROGRESS': return {
        icon: <Headphones className="h-3.5 w-3.5 shrink-0 text-amber-500" />,
        label: withAgent(t('tickets.history_assigned'), agentName, 'text-amber-500'),
        time: ticket.assignedAt,
      };
      case 'RESOLVED': return {
        icon: <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />,
        label: withAgent(t('tickets.history_resolved'), agentName, 'text-green-500'),
        time: ticket.resolvedAt,
      };
      case 'CLOSED': return {
        icon: <X className="h-3.5 w-3.5 shrink-0 text-zinc-400" />,
        label: withAgent(t('tickets.history_closed'), agentName, 'text-zinc-400'),
        time: ticket.closedAt,
      };
      case 'MERGED': return {
        icon: <GitMerge className="h-3.5 w-3.5 shrink-0 text-zinc-400" />,
        label: withAgent(`${t('tickets.history_merged')} #${ticket.mergedIntoTicketId}`, agentName, 'text-zinc-400'),
        time: ticket.mergedAt,
      };
    }
  })();

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1.5 text-[13px] text-muted-foreground">
        {line.icon}
        {line.label}
      </div>
      {line.time && (
        <span className="shrink-0 text-[12px] text-muted-foreground">{formatRelativeTime(line.time, lang)}</span>
      )}
    </div>
  );
}
