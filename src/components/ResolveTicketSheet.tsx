import { useEffect, useState } from 'react';

import { Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/hooks/useT';

type ResolveTicketSheetProps = {
  isPending: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve: (note: string | null) => void;
};

export function ResolveTicketSheet({ isPending, open, onOpenChange, onResolve }: ResolveTicketSheetProps) {
  const t = useT();
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) setNote('');
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-xl gap-1" showCloseButton={false}>
        <SheetHeader className="flex-row items-center justify-between">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Check className="h-5 w-5 shrink-0" />
            {t('tickets.ticket_detail_action_resolve')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-3 px-4 pb-4">
          <Textarea
            placeholder={t('tickets.resolve_sheet_placeholder')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-24 resize-none"
          />
          <Button
            variant="outline"
            className="w-full"
            disabled={isPending}
            onClick={() => onResolve(null)}
          >
            {t('tickets.resolve_skip')}
          </Button>
          <Button
            className="w-full"
            disabled={isPending || note.trim().length === 0}
            onClick={() => onResolve(note.trim())}
          >
            {t('tickets.resolve_submit')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
