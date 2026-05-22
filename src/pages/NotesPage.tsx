import { useMemo, useState } from 'react';

import { AlertTriangle, ArrowLeft, Plus, Search, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';

import { NoteCard } from '@/components/ticket/NoteCard';
import { NoteEditSheet } from '@/components/NoteEditSheet';
import { Input } from '@/components/ui/input';
import { FetchError } from '@/components/ui/list-error';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTicket } from '@/hooks/queries/useTicket';
import { useBackButton } from '@/hooks/useBackButton';
import { useT } from '@/hooks/useT';
import type { Note } from '@/types/ticket';

type NoteFilter = 'all' | 'client' | 'ticket';

export function NotesPage() {
  const { id } = useParams<{ id: string }>();
  const ticketId = Number(id);
  const navigate = useNavigate();
  const t = useT();
  const [activeFilter, setActiveFilter] = useState<NoteFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editNote, setEditNote] = useState<Note | undefined>();
  const [editOpen, setEditOpen] = useState(false);

  useBackButton();

  const FILTERS: { id: NoteFilter; label: string }[] = [
    { id: 'all', label: t('notes.filter_all') },
    { id: 'client', label: t('notes.filter_client') },
    { id: 'ticket', label: t('notes.filter_ticket') },
  ];

  const hasTicketContext = !isNaN(ticketId) && ticketId > 0;
  const { data: ticket, isError, isLoading, refetch } = useTicket(ticketId);

  const notes = ticket?.notes ?? [];

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      if (activeFilter === 'client' && note.type !== 'client') return false;
      if (activeFilter === 'ticket' && note.type !== 'ticket') return false;
      if (searchQuery) {
        return note.text.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [notes, activeFilter, searchQuery]);

  const showControls = !isLoading && !isError && notes.length > 0;
  const showTicketWarning = !isLoading && !isError && activeFilter === 'ticket' && !hasTicketContext;

  function openEdit(note: Note) {
    setEditNote(note);
    setEditOpen(true);
  }

  return (
    <>
      <div className="flex min-h-dvh flex-col bg-background">
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-md">
          <button
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background"
            onClick={() => void navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="flex-1 text-center text-base font-semibold tracking-[-0.2px]">{t('notes.page_title')}</h1>
          <button
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {showControls && (
          <div className="space-y-2 px-4 pb-2 pt-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('notes.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl bg-background pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={t('common.clear_search')}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as NoteFilter)}>
              <TabsList className="w-full">
                {FILTERS.map((f) => (
                  <TabsTrigger key={f.id} value={f.id} className="flex-auto">
                    {f.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}

        <div className="flex-1 space-y-2 px-4 pb-4 pt-2">
          {isLoading && (
            <>
              <NoteCardSkeleton />
              <NoteCardSkeleton />
              <NoteCardSkeleton />
            </>
          )}

          {!isLoading && isError && (
            <FetchError description={t('notes.load_error')} onRetry={refetch} />
          )}

          {showTicketWarning && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <p className="text-sm text-muted-foreground">
                {t('notes.no_context')}
              </p>
            </div>
          )}

          {!isLoading && !isError && !showTicketWarning && filteredNotes.length === 0 && (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              {searchQuery ? t('notes.no_results') : t('notes.empty')}
            </div>
          )}

          {!isLoading && !isError && !showTicketWarning && filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} ticketId={ticketId} onEdit={openEdit} onDelete={() => {}} />
          ))}
        </div>
      </div>

      <NoteEditSheet
        note={editNote}
        ticketId={hasTicketContext ? ticketId : undefined}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditNote(undefined);
        }}
      />
      <NoteEditSheet
        ticketId={hasTicketContext ? ticketId : undefined}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </>
  );
}

function NoteCardSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-background px-4 py-3.5 shadow-sm">
      <Skeleton className="h-5 w-20" />
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="h-3.5 w-3/5" />
      </div>
      <div className="flex items-center gap-1.5">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}
