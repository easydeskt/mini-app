import React, { useState } from 'react';

import { ChevronRight, Plus } from 'lucide-react';

import { VaultCreateSheet } from '@/components/admin/VaultCreateSheet';
import { VaultEditSheet } from '@/components/admin/VaultEditSheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { FetchError } from '@/components/ui/list-error';
import { Skeleton } from '@/components/ui/skeleton';
import { useBackButton } from '@/hooks/useBackButton';
import { useSecrets } from '@/hooks/queries/useVault';
import { useT } from '@/hooks/useT';
import type { VaultSecret } from '@/types/vault';

type SecretRowProps = { secret: VaultSecret; onEdit: () => void };

function SecretRow({ secret, onEdit }: SecretRowProps) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 active:bg-muted"
    >
      <div className="min-w-0 flex-1">
        <p className="font-mono text-sm font-medium">{secret.name}</p>
        {secret.description && (
          <p className="truncate text-xs text-muted-foreground">{secret.description}</p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

export function VaultPage() {
  const { data: secrets, isError, isLoading, refetch, error } = useSecrets();
  const t = useT();

  const [editTarget, setEditTarget] = useState<VaultSecret | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  useBackButton();

  return (
    <div className="flex min-h-dvh flex-col bg-background">

      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-120 px-4 pb-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t('vault.page_title')}
                {!isLoading && secrets.length > 0 && (
                  <span className="font-normal text-muted-foreground"> • {secrets.length}</span>
                )}
              </h1>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => setCreateOpen(true)}
              aria-label={t('vault.add')}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-120 flex-1 flex-col px-4 py-4">
        {isLoading ? (
          <div className="space-y-0 overflow-hidden rounded-xl border bg-card">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <FetchError description={t('vault.load_error')} onRetry={refetch} error={error} />
        ) : secrets.length === 0 ? (
          <Empty className="border-none">
            <EmptyHeader>
              <EmptyMedia variant="icon"><Plus /></EmptyMedia>
              <EmptyTitle>{t('vault.empty_title')}</EmptyTitle>
              <EmptyDescription>{t('vault.empty_description')}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm" onClick={() => setCreateOpen(true)}>{t('vault.add')}</Button>
            </EmptyContent>
          </Empty>
        ) : (
          <Card className="py-0">
            <CardContent className="p-0">
              {secrets.map((secret, i) => (
                <React.Fragment key={secret.id}>
                  {i > 0 && <div className="mx-4 h-px bg-border" />}
                  <SecretRow
                    secret={secret}
                    onEdit={() => { setEditTarget(secret); setEditOpen(true); }}
                  />
                </React.Fragment>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <VaultEditSheet secret={editTarget} open={editOpen} onOpenChange={setEditOpen} />
      <VaultCreateSheet open={createOpen} onOpenChange={setCreateOpen} />

    </div>
  );
}
