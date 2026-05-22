import { useState } from 'react';

import { MonitorSmartphone, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useChannelProviders } from '@/hooks/useChannelProviders';
import { useT } from '@/hooks/useT';

type ChannelTypePickerSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (brand: string) => void;
};

export function ChannelTypePickerSheet({
  open,
  onOpenChange,
  onSelect,
}: ChannelTypePickerSheetProps) {
  const [selected, setSelected] = useState('');
  const { data: providers } = useChannelProviders();
  const t = useT();

  const handleContinue = () => {
    if (!selected) return;
    onOpenChange(false);
    onSelect(selected);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={v => {
        if (!v) setSelected('');
        onOpenChange(v);
      }}
    >
      <SheetContent side="bottom" className="rounded-t-xl gap-1" showCloseButton={false}>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-base">
            <Plus className="h-5 w-5 shrink-0" />
            {t('channels.picker_title') ?? 'Add channel'}
          </SheetTitle>
          <SheetDescription>{t('channels.picker_description') ?? 'Choose a provider for the new channel to start handling client requests.'}</SheetDescription>
        </SheetHeader>
        <div className="max-h-72 overflow-y-auto px-4">
          <RadioGroup value={selected} onValueChange={setSelected} className="gap-2">
            {(providers ?? []).map(provider => (
              <label
                key={provider.brand}
                htmlFor={`provider-${provider.brand}`}
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5"
              >
                <MonitorSmartphone className="size-7 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{provider.name}</p>
                  <p className="text-xs text-muted-foreground">{t(`channel.${provider.brand}.description`) ?? provider.name}</p>
                </div>
                <RadioGroupItem id={`provider-${provider.brand}`} value={provider.brand} />
              </label>
            ))}
          </RadioGroup>
        </div>
        <SheetFooter>
          <Button className="w-full" onClick={handleContinue} disabled={!selected}>
            {t('channels.picker_continue') ?? 'Continue'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
