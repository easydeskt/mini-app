import { useState } from 'react';
import React from 'react';

import { ChevronRight, Plus } from 'lucide-react';

import { TagCreateSheet } from '@/components/admin/TagCreateSheet';
import { TagEditSheet } from '@/components/admin/TagEditSheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { FetchError } from '@/components/ui/list-error';
import { Skeleton } from '@/components/ui/skeleton';
import { useBackButton } from '@/hooks/useBackButton';
import { useTags } from '@/hooks/queries/useTags';
import { useT } from '@/hooks/useT';
import type { Tag } from '@/types/tag';
import { rgbaIntToCss } from '@/utils/color';

type TagRowProps = { tag: Tag; onEdit: () => void };

function TagRow({ tag, onEdit }: TagRowProps) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 active:bg-muted"
    >
      <span
        className="relative h-3.5 w-3.5 shrink-0 overflow-hidden rounded-full"
        style={{ backgroundColor: tag.color != null ? rgbaIntToCss(tag.color) : '#888888' }}
      >
        <span className="absolute inset-0 bg-white/20 dark:bg-black/20" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{tag.name}</p>
        {tag.ticketCount !== undefined && (
          <p className="text-xs text-muted-foreground">{tag.ticketCount}</p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

export function TagsPage() {
  const { data: tags, isError, isLoading, refetch, error } = useTags();
  const t = useT();

  const [editTarget, setEditTarget] = useState<Tag | null>(null);
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
              {t('tags.page_title') ?? 'Tags'}
              {!isLoading && tags.length > 0 && (
                <span className="font-normal text-muted-foreground"> • {tags.length}</span>
              )}
            </h1>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => setCreateOpen(true)}
            aria-label={t('tags.create') ?? 'Create tag'}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-120 flex-1 flex-col px-4 py-4">
        {isLoading ? (
          <div className="space-y-0 overflow-hidden rounded-xl border bg-card">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <FetchError description={t('tags.load_error') ?? 'Failed to load the tag list'} onRetry={refetch} error={error} />
        ) : tags.length === 0 ? (
          <Empty className="border-none">
            <EmptyHeader>
              <EmptyMedia variant="icon"><Plus /></EmptyMedia>
              <EmptyTitle>{t('tags.empty_title')}</EmptyTitle>
              <EmptyDescription>{t('tags.empty_description')}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm" onClick={() => setCreateOpen(true)}>{t('tags.create')}</Button>
            </EmptyContent>
          </Empty>
        ) : (
          <Card className="py-0">
            <CardContent className="p-0">
              {tags.map((tag, i) => (
                <React.Fragment key={tag.id}>
                  {i > 0 && <div className="mx-4 h-px bg-border" />}
                  <TagRow
                    tag={tag}
                    onEdit={() => { setEditTarget(tag); setEditOpen(true); }}
                  />
                </React.Fragment>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <TagEditSheet tag={editTarget} open={editOpen} onOpenChange={setEditOpen} />
      <TagCreateSheet open={createOpen} onOpenChange={setCreateOpen} />

    </div>
  );
}
