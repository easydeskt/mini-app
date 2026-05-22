import { ChevronRight, Hash, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useT } from '@/hooks/useT';
import type { Note } from '@/types/ticket';
import { formatRelativeTime } from '@/utils/formatters';
import { getInitials } from '@/utils/initials';

type NoteItemProps = {
  note: Note;
};

function NoteItem({ note }: NoteItemProps) {
  const t = useT();
  const initials = getInitials(note.authorName);
  return (
    <div className="px-4 py-3">
      <span className="mb-2 inline-flex items-center gap-1 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        {note.type === 'ticket' ? <Hash className="h-2.5 w-2.5" /> : <UserRound className="h-2.5 w-2.5" />}
        {note.type === 'ticket' ? t('notes.type_ticket') : t('notes.type_client')}
      </span>
      <p className="mb-2 line-clamp-2 text-sm">{note.text}</p>
      <div className="flex items-center gap-1.5">
        <Avatar className="h-4 w-4">
          <AvatarFallback className="bg-zinc-200 text-[8px] font-semibold dark:bg-zinc-700">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="text-xs text-muted-foreground">{note.authorName} · {formatRelativeTime(note.createdAt)}</span>
      </div>
    </div>
  );
}

type NotesSectionProps = {
  notes: Note[];
  ticketId: number;
};

export function NotesSection({ notes, ticketId }: NotesSectionProps) {
  const t = useT();
  const navigate = useNavigate();
  const visible = notes.slice(0, 1);
  return (
    <div>
      <p className="mb-1.5 px-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {t('tickets.detail_section_notes')}
      </p>
      <Card className="py-0">
        <CardContent className="p-0">
          {visible.map((note) => (
            <NoteItem key={note.id} note={note} />
          ))}
          <div className="mx-4 h-px bg-border" />
          <button
            type="button"
            onClick={() => void navigate(`/tickets/${ticketId}/notes`)}
            className="flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left transition-colors hover:bg-muted/50 active:bg-muted"
          >
            <span className="text-sm">{t('tickets.detail_notes_view_all')} · {notes.length}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
