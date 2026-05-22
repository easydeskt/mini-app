import { useState } from 'react';

import { Hash, MoreHorizontal, Pencil, Trash2, UserRound } from 'lucide-react';

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useT } from '@/hooks/useT';
import { formatRelativeTime } from '@/utils/formatters';
import { getInitials } from '@/utils/initials';
import type { Note } from '@/types/ticket';

type NoteCardProps = {
  note: Note;
  ticketId?: number;
  onEdit?: (note: Note) => void;
  onDelete?: (note: Note) => void;
};

export function NoteCard({ note, ticketId, onEdit, onDelete }: NoteCardProps) {
  const t = useT();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const initials = getInitials(note.authorName);
  const canEdit = Boolean(onEdit || onDelete);

  return (
    <>
      <div className="rounded-xl border border-border bg-background px-4 py-3.5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {note.type === 'ticket'
              ? <Hash className="h-2.5 w-2.5" />
              : <UserRound className="h-2.5 w-2.5" />}
            {note.type === 'ticket'
              ? <>{t('notes.type_ticket')}<span className="font-normal opacity-50">•</span>#{ticketId}</>
              : t('notes.type_client')}
          </span>
          {canEdit && (
            <>
              <span className="flex-1" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(note)}>
                      <Pencil className="h-4 w-4" />
                      {t('notes.menu_edit')}
                    </DropdownMenuItem>
                  )}
                  {onEdit && onDelete && <DropdownMenuSeparator />}
                  {onDelete && (
                    <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
                      <Trash2 className="h-4 w-4" />
                      {t('notes.menu_delete')}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>

        <p className="mb-3 text-sm leading-snug">{note.text}</p>

        <div className="flex items-center gap-1.5">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="bg-zinc-200 text-[8px] font-semibold dark:bg-zinc-700">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">
            {note.authorName} · {formatRelativeTime(note.createdAt)}
          </span>
        </div>
      </div>

      {onDelete && (
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>{t('notes.delete_confirm_title')}</AlertDialogTitle>
              <AlertDialogDescription>{t('notes.delete_confirm_description')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('notes.delete_cancel')}</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => { onDelete(note); setDeleteOpen(false); }}
              >
                {t('notes.delete_confirm_ok')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
