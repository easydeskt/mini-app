import { useEffect, useState } from 'react';

import { NotebookPen, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

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
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/hooks/useT';
import type { Note, NoteType } from '@/types/ticket';

type NoteEditSheetProps = {
  note?: Note;
  ticketId?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function NoteEditSheet({ note, ticketId, open, onOpenChange }: NoteEditSheetProps) {
  const isEditing = !!note;
  const hasTicketContext = ticketId != null && !isNaN(ticketId) && ticketId > 0;
  const t = useT();

  const [text, setText] = useState('');
  const [scope, setScope] = useState<NoteType>('client');
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setText(note?.text ?? '');
      setScope(note?.type ?? (hasTicketContext ? 'ticket' : 'client'));
    }
  }, [open, note?.text, note?.type, hasTicketContext]);

  function handleScopeChange(value: string) {
    if (value === 'ticket' && !hasTicketContext) {
      toast.warning(t('notes.warning_no_context'));
      return;
    }
    setScope(value as NoteType);
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-xl gap-1" showCloseButton={false}>
          <SheetHeader className="flex-row items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-base">
              <NotebookPen className="h-5 w-5 shrink-0" />
              {isEditing ? t('notes.edit_title_edit') : t('notes.edit_title_new')}
            </SheetTitle>
            {isEditing && (
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 rounded-full text-destructive hover:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </SheetHeader>

          <div className="flex flex-col gap-4 px-4 pb-4">
            <Textarea
              placeholder={t('notes.edit_placeholder')}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-24 resize-none"
            />

            <RadioGroup
              value={scope}
              onValueChange={handleScopeChange}
              className="gap-0 overflow-hidden rounded-lg border"
            >
              <label
                htmlFor="scope-ticket"
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${hasTicketContext ? 'cursor-pointer hover:bg-muted/50 active:bg-muted' : 'cursor-not-allowed opacity-50'}`}
              >
                <RadioGroupItem value="ticket" id="scope-ticket" disabled={!hasTicketContext} />
                <div>
                  <p className="text-sm">{t('notes.scope_ticket_label')}</p>
                  <p className="text-xs text-muted-foreground">
                    {hasTicketContext ? `${t('notes.scope_ticket_description_prefix')}${ticketId}` : t('notes.scope_ticket_no_context')}
                  </p>
                </div>
              </label>
              <div className="h-px bg-border" />
              <label
                htmlFor="scope-client"
                className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 active:bg-muted"
              >
                <RadioGroupItem value="client" id="scope-client" />
                <div>
                  <p className="text-sm">{t('notes.scope_client_label')}</p>
                  <p className="text-xs text-muted-foreground">{t('notes.scope_client_description')}</p>
                </div>
              </label>
            </RadioGroup>

            <Button
              className="w-full"
              disabled={text.trim().length === 0}
              onClick={() => onOpenChange(false)}
            >
              {isEditing ? t('notes.save') : t('notes.create')}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {isEditing && (
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
                onClick={() => { setDeleteOpen(false); onOpenChange(false); }}
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
