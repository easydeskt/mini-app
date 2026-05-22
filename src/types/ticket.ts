export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'MERGED';
export type NoteType = 'ticket' | 'client';
export type Note = {
  authorName: string;
  createdAt: string;
  id: number;
  text: string;
  type: NoteType;
};
export type TicketPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type TicketTag = {
  color: number | null;
  id: number;
  name: string;
};

export type TicketSourceType = 'tg' | 'mail' | 'vk';

export type Ticket = {
  attachmentCount: number;
  assignedAgentId: string | null;
  unreadCount: number;
  clientUrl: string | null;
  assignedAt: string | null;
  channelName: string | null;
  clientName: string | null;
  closedAt: string | null;
  conversationId: number;
  createdAt: string;
  id: number;
  lastMessageAt: string;
  mergedAt: string | null;
  mergedIntoTicketId: number | null;
  notes: Note[];
  messagePreview: string | null;
  priority: TicketPriority | null;
  resolutionNote: string | null;
  resolvedAt: string | null;
  sourceType: TicketSourceType | null;
  status: TicketStatus;
  tags: TicketTag[];
  topicUrl: string | null;
};

export type TicketFilter = 'all' | 'mine' | 'unassigned' | 'open' | 'progress' | 'resolved';
