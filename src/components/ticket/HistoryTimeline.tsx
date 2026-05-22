import type { ReactNode } from 'react';

import { Check, GitMerge, Headphones, Plus, X } from 'lucide-react';

import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from '@/components/reui/timeline';
import { withAgent } from '@/components/ticket/ticketHelpers';
import { useT } from '@/hooks/useT';
import type { Ticket } from '@/types/ticket';
import { formatExactTime } from '@/utils/formatters';

type HistoryTimelineProps = {
  agentName: string | null;
  ticket: Ticket;
};

type HistoryEvent = {
  icon: ReactNode;
  label: ReactNode;
  time?: string;
};

const INDICATOR_CLASS = 'flex size-6 items-center justify-center border-none bg-muted-foreground/15 text-foreground group-data-[orientation=vertical]/timeline:-left-7';

function buildHistoryEvents(ticket: Ticket, agentName: string | null, t: (key: string) => string): HistoryEvent[] {
  const events: HistoryEvent[] = [
    {
      icon: <Plus className="size-3.5" />,
      label: t('tickets.history_created'),
      time: ticket.createdAt,
    },
  ];

  if (['IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(ticket.status) && ticket.assignedAgentId) {
    events.push({
      icon: <Headphones className="size-3.5" />,
      label: withAgent(t('tickets.history_assigned'), agentName),
      time: ticket.assignedAt ?? undefined,
    });
  }

  if (ticket.status === 'RESOLVED') {
    events.push({
      icon: <Check className="size-3.5" />,
      label: withAgent(t('tickets.history_resolved'), agentName),
      time: ticket.resolvedAt ?? undefined,
    });
  }

  if (ticket.status === 'CLOSED') {
    events.push({
      icon: <X className="size-3.5" />,
      label: withAgent(t('tickets.history_closed'), agentName),
      time: ticket.closedAt ?? undefined,
    });
  }

  if (ticket.status === 'MERGED') {
    events.push({
      icon: <GitMerge className="size-3.5" />,
      label: withAgent(`${t('tickets.history_merged')} #${ticket.mergedIntoTicketId}`, agentName),
      time: ticket.mergedAt ?? undefined,
    });
  }

  return events;
}

export function HistoryTimeline({ ticket, agentName }: HistoryTimelineProps) {
  const t = useT();
  const events = buildHistoryEvents(ticket, agentName, t);
  return (
    <Timeline defaultValue={events.length} className="w-full">
      {events.map((event, idx) => (
        <TimelineItem
          key={idx}
          step={idx + 1}
          className="group-data-[orientation=vertical]/timeline:ms-10"
        >
          <TimelineHeader>
            <TimelineSeparator
              className="group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-6.5"
              style={{ backgroundColor: 'rgb(128 128 128 / 0.18)' }}
            />
            <TimelineTitle className="mt-0.5">{event.label}</TimelineTitle>
            <TimelineIndicator className={INDICATOR_CLASS}>
              {event.icon}
            </TimelineIndicator>
          </TimelineHeader>
          {event.time && (
            <TimelineContent>
              <TimelineDate className="mb-0 mt-0 text-muted-foreground">
                {formatExactTime(event.time)}
              </TimelineDate>
            </TimelineContent>
          )}
        </TimelineItem>
      ))}
    </Timeline>
  );
}
