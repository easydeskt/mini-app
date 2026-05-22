import { Fragment, useEffect, useState } from 'react';

import { Flag } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useT } from '@/hooks/useT';
import type { TicketPriority } from '@/types/ticket';

type PrioritySheetProps = {
  currentPriority: TicketPriority | null;
  isPending: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (priority: TicketPriority | null) => void;
};

type PriorityOption = {
  colorClass: string;
  label: string;
  sublabel: string;
  value: TicketPriority | 'none';
};

export function PrioritySheet({ currentPriority, isPending, open, onOpenChange, onSave }: PrioritySheetProps) {
  const t = useT();
  const [selected, setSelected] = useState<TicketPriority | 'none'>(currentPriority ?? 'none');

  const PRIORITY_OPTIONS: PriorityOption[] = [
    { value: 'HIGH', label: t('tickets.priority_high'), sublabel: t('tickets.priority_high_sublabel'), colorClass: 'text-red-500' },
    { value: 'MEDIUM', label: t('tickets.priority_medium'), sublabel: t('tickets.priority_medium_sublabel'), colorClass: 'text-amber-500' },
    { value: 'LOW', label: t('tickets.priority_low'), sublabel: t('tickets.priority_low_sublabel'), colorClass: 'text-green-500' },
    { value: 'none', label: t('tickets.priority_none'), sublabel: t('tickets.priority_none_sublabel'), colorClass: 'text-muted-foreground' },
  ];

  useEffect(() => {
    if (open) setSelected(currentPriority ?? 'none');
  }, [open, currentPriority]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-xl gap-1" showCloseButton={false}>
        <SheetHeader className="flex-row items-center justify-between">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Flag className="h-5 w-5 shrink-0" />
            {t('tickets.priority_sheet_title')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-4">
          <RadioGroup
            value={selected}
            onValueChange={(v) => setSelected(v as TicketPriority | 'none')}
            className="gap-0 overflow-hidden rounded-lg border"
          >
            {PRIORITY_OPTIONS.map((opt, idx) => (
              <Fragment key={opt.value}>
                {idx > 0 && <div className="h-px bg-border" />}
                <label
                  htmlFor={`priority-${opt.value}`}
                  className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 active:bg-muted"
                >
                  <RadioGroupItem value={opt.value} id={`priority-${opt.value}`} />
                  <div>
                    <p className={`text-sm ${opt.colorClass}`}>{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.sublabel}</p>
                  </div>
                </label>
              </Fragment>
            ))}
          </RadioGroup>
          <Button
            className="w-full"
            disabled={isPending}
            onClick={() => onSave(selected === 'none' ? null : selected)}
          >
            {t('tickets.priority_save')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
