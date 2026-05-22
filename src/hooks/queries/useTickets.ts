import { useQuery } from '@tanstack/react-query';

import { fetchTickets, type ApiTicketResponse } from '@/api/tickets';
import { queryKeys } from '@/api/query-keys';
import type { Note, NoteType, Ticket, TicketPriority, TicketStatus } from '@/types/ticket';

export function toTicket(t: ApiTicketResponse): Ticket {
  return {
    attachmentCount: t.attachment_count ?? 0,
    assignedAgentId: t.assigned_agent_id,
    unreadCount: t.unread_count ?? 0,
    clientUrl: t.client_url ?? null,
    assignedAt: t.assigned_at ?? null,
    channelName: t.channel_name ?? null,
    clientName: t.client_name ?? null,
    closedAt: t.closed_at ?? null,
    conversationId: t.conversation_id,
    createdAt: t.created_at,
    id: t.id,
    lastMessageAt: t.last_message_at,
    mergedAt: t.merged_at ?? null,
    mergedIntoTicketId: t.merged_into_ticket_id,
    notes: (t.notes ?? []).map((n): Note => ({
      authorName: n.author_name,
      createdAt: n.created_at,
      id: n.id,
      text: n.text,
      type: n.type.toLowerCase() as NoteType,
    })),
    messagePreview: t.message_preview ?? null,
    priority: t.priority != null ? (t.priority.toUpperCase() as TicketPriority) : null,
    resolutionNote: t.resolution_note ?? null,
    resolvedAt: t.resolved_at ?? null,
    sourceType: (t.source_type?.toLowerCase() ?? null) as Ticket['sourceType'],
    status: t.status.toUpperCase() as TicketStatus,
    tags: t.tags.map(tag => ({ color: tag.color, id: tag.id, name: tag.name })),
    topicUrl: t.topic_url ?? null,
  };
}

export function useTickets(): { data: Ticket[]; isError: boolean; isLoading: boolean; refetch: () => void; error: unknown } {
  const { data = [], isError, isLoading, refetch, error } = useQuery({
    queryKey: queryKeys.tickets.all,
    queryFn: () => fetchTickets(),
    retry: false,
  });
  return { data: data.map(toTicket), isError, isLoading, refetch: () => { void refetch(); }, error };
}
