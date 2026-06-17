import { useState } from 'react';

import { Eye, EyeOff, Plus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ApiError } from '@/api/client';
import { queryKeys } from '@/api/query-keys';
import { createSecret } from '@/api/vault';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useT } from '@/hooks/useT';

const NAME_PATTERN = /^[A-Z][A-Z0-9_]*$/;

type VaultCreateSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function VaultCreateSheet({ open, onOpenChange }: VaultCreateSheetProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [showValue, setShowValue] = useState(false);
  const t = useT();

  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: () => createSecret(name.trim(), description.trim(), value),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.vault.all });
      setName('');
      setDescription('');
      setValue('');
      setShowValue(false);
      onOpenChange(false);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        toast.error(t('vault.name_conflict'));
      } else {
        toast.error(t('vault.create_error'));
      }
    },
  });

  const isNameValid = NAME_PATTERN.test(name.trim());
  const canSubmit = isNameValid && value.trim() !== '' && !createMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-xl gap-1" showCloseButton={false}>
        <SheetHeader className="flex-row items-center justify-between">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Plus className="h-5 w-5 shrink-0" />
            {t('vault.create_sheet_title')}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">
          <div className="space-y-1.5">
            <Label htmlFor="vault-create-name">{t('vault.field_name')}</Label>
            <p className="-mt-1 text-xs text-muted-foreground">{t('vault.field_name_hint')}</p>
            <Input
              id="vault-create-name"
              value={name}
              onChange={e => setName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
              placeholder="BOT_TOKEN"
              className="font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vault-create-description">{t('vault.field_description')}</Label>
            <Input
              id="vault-create-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t('vault.field_description')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vault-create-value">{t('vault.field_value')}</Label>
            <div className="relative">
              <Input
                id="vault-create-value"
                type={showValue ? 'text' : 'password'}
                value={value}
                onChange={e => setValue(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                onClick={() => setShowValue(v => !v)}
                tabIndex={-1}
              >
                {showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button className="w-full" onClick={() => createMutation.mutate()} disabled={!canSubmit}>
            {t('vault.save')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
