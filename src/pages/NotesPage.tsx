import { useMemo, useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Plus, Search, X } from 'lucide-react';
import { useParams } from 'react-router';

import { NoteCard } from '@/components/ticket/NoteCard';
import { NoteEditSheet } from '@/components/NoteEditSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FetchError } from '@/components/ui/list-error';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { deleteNote } from '@/api/tickets';
import { queryKeys } from '@/api/query-keys';
import { useTicket } from '@/hooks/queries/useTicket';
import { useBackButton } from '@/hooks/useBackButton';
import { useT } from '@/hooks/useT';
import type { Note } from '@/types/ticket';

type NoteFilter = 'all' | 'client' | 'ticket';

export function NotesPage() {
  const { id } = useParams<{ id: string }>();
  const ticketId = Number(id);
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
  const { data: ticket, isError, isLoading, refetch, error } = useTicket(ticketId);

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (note: Note) => deleteNote(ticketId, note.id, note.type),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(ticketId) }),
  });

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
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md">
          <div className="mx-auto max-w-[480px] px-4 pb-3 pt-4">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{t('notes.page_title')}</h1>
              <div className="mt-0.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 rounded-full"
                  onClick={() => setCreateOpen(true)}
                  aria-label={t('notes.create') ?? 'Create note'}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {showControls && (
          <div className="mx-auto w-full max-w-[480px] space-y-2 px-4 pb-2 pt-3">
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

        <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col space-y-2 px-4 pb-4 pt-2">
          {isLoading && (
            <>
              <NoteCardSkeleton />
              <NoteCardSkeleton />
              <NoteCardSkeleton />
            </>
          )}

          {!isLoading && isError && (
            <FetchError description={t('notes.load_error')} onRetry={refetch} error={error} />
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
            <NoteCard key={note.id} note={note} ticketId={ticketId} onEdit={openEdit} onDelete={(n) => deleteMutation.mutate(n)} />
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
