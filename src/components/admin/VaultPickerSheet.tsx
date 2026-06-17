import { useState } from 'react';

import { ChevronRight, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useSecrets } from '@/hooks/queries/useVault';
import { useT } from '@/hooks/useT';
import type { VaultSecret } from '@/types/vault';

type VaultPickerSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (secretName: string) => void;
};

export function VaultPickerSheet({ open, onOpenChange, onSelect }: VaultPickerSheetProps) {
  const [query, setQuery] = useState('');
  const { data: secrets, isLoading } = useSecrets();
  const navigate = useNavigate();
  const t = useT();

  const filtered = query.trim()
    ? secrets.filter(s =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        (s.description?.toLowerCase().includes(query.toLowerCase()) ?? false),
      )
    : secrets;

  function handleSelect(secret: VaultSecret) {
    onSelect(secret.name);
    onOpenChange(false);
    setQuery('');
  }

  function handleOpenChange(value: boolean) {
    if (!value) setQuery('');
    onOpenChange(value);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="rounded-t-xl gap-0 max-h-[80dvh]" showCloseButton={false}>
        <SheetHeader className="px-4 pb-3 pt-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-5 w-5 shrink-0" />
            {t('vault.picker_title')}
          </SheetTitle>
        </SheetHeader>

        <div className="border-b px-4 pb-3">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('vault.picker_search')}
            autoFocus
          />
        </div>

        <div className="overflow-y-auto">
          {isLoading ? (
            <div className="space-y-px px-4 py-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-3">
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          ) : secrets.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">{t('vault.picker_empty')}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { onOpenChange(false); void navigate('/admin/vault'); }}
              >
                {t('vault.picker_empty_action')}
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">{t('vault.picker_no_results')}</p>
            </div>
          ) : (
            <div className="py-1">
              {filtered.map(secret => (
                <button
                  key={secret.id}
                  type="button"
                  onClick={() => handleSelect(secret)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 active:bg-muted"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-sm font-medium">{secret.name}</span>
                    {secret.description && (
                      <span className="block truncate text-xs text-muted-foreground">{secret.description}</span>
                    )}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
