import { useEffect, useState } from 'react';

import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ApiError } from '@/api/client';
import { queryKeys } from '@/api/query-keys';
import { deleteSecret, updateSecret } from '@/api/vault';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useT } from '@/hooks/useT';
import type { VaultSecret } from '@/types/vault';

type VaultEditSheetProps = {
  secret: VaultSecret | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function VaultEditSheet({ secret, open, onOpenChange }: VaultEditSheetProps) {
  const [description, setDescription] = useState('');
  const [newValue, setNewValue] = useState('');
  const [showValue, setShowValue] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const t = useT();

  useEffect(() => {
    if (secret) {
      setDescription(secret.description ?? '');
      setNewValue('');
      setShowValue(false);
    }
  }, [secret]);

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: () => updateSecret(secret!.id, description.trim(), newValue || undefined),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.vault.all });
      onOpenChange(false);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        toast.error(t('vault.name_conflict'));
      } else {
        toast.error(t('vault.update_error'));
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteSecret(secret!.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.vault.all });
      setDeleteOpen(false);
      onOpenChange(false);
    },
    onError: () => {
      toast.error(t('vault.delete_error'));
    },
  });

  if (!secret) return null;

  const isPending = updateMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-xl gap-1" showCloseButton={false}>
          <SheetHeader className="flex-row items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Pencil className="h-5 w-5 shrink-0" />
              {t('vault.edit_sheet_title')}
            </SheetTitle>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 rounded-full text-destructive hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </SheetHeader>

          <div className="flex flex-col gap-4 px-4 pb-4">
            <div className="space-y-1.5">
              <Label>{t('vault.field_name')}</Label>
              <p className="rounded-md border bg-muted px-3 py-2 font-mono text-sm text-muted-foreground">
                {secret.name}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vault-edit-description">{t('vault.field_description')}</Label>
              <Input
                id="vault-edit-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={t('vault.field_description')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vault-edit-value">{t('vault.field_value')}</Label>
              <div className="relative">
                <Input
                  id="vault-edit-value"
                  type={showValue ? 'text' : 'password'}
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  placeholder={t('vault.field_value_edit_placeholder')}
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

            <Button
              className="w-full"
              onClick={() => updateMutation.mutate()}
              disabled={isPending}
            >
              {t('vault.save')}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('vault.delete_confirm_title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('vault.delete_confirm_description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('vault.delete_cancel')}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {t('vault.delete_confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
