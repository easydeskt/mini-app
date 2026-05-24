import { Check, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useT } from '@/hooks/useT';

type AgentAddSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AgentAddSheet({ open, onOpenChange }: AgentAddSheetProps) {
  const t = useT();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-xl gap-1" showCloseButton={false}>
        <SheetHeader className="flex-row items-center justify-between">
          <SheetTitle className="flex items-center gap-2 text-base">
            <UserPlus className="h-5 w-5 shrink-0" />
            {t('agents.add_sheet_title') ?? 'Add agent'}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">

          <p className="text-sm text-muted-foreground">
            {t('agents.add_sheet_description') ?? 'Send the command in the chat with the EasyDesk bot:'}
          </p>

          <div className="rounded-lg bg-muted px-4 py-3">
            <p className="font-mono text-sm">
              /add_agent{' '}
              <span className="text-muted-foreground">{t('agents.add_sheet_arg')}</span>
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            {t('agents.add_sheet_note_prefix') ?? 'The agent will be added as an'}{' '}
            <span className="font-medium text-foreground">{t('agents.add_sheet_note_role') ?? 'operator'}</span>,{' '}
            {t('agents.add_sheet_note_suffix') ?? 'the role can be changed here. No confirmation required.'}
          </p>

          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            <Check className="h-4 w-4" />
            {t('agents.add_sheet_ok') ?? 'Got it'}
          </Button>

        </div>
      </SheetContent>
    </Sheet>
  );
}
