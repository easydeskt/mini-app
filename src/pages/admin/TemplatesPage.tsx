import React from 'react';

import { ChevronRight, Paperclip, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { FetchError } from '@/components/ui/list-error';
import { Skeleton } from '@/components/ui/skeleton';
import { useBackButton } from '@/hooks/useBackButton';
import { useTemplates } from '@/hooks/queries/useTemplates';
import { useT } from '@/hooks/useT';
import type { ReplyTemplate } from '@/types/template';

type TemplateRowProps = {
  template: ReplyTemplate;
  onClick: () => void;
};

function TemplateRow({ template, onClick }: TemplateRowProps) {
  const previewText = template.content?.trim() || null;
  const attachmentCount = template.attachments.length;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 active:bg-muted"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-medium">{template.name}</p>
          {attachmentCount > 0 && (
            <Badge variant="secondary" className="h-5 shrink-0 gap-1 px-1.5 text-xs">
              <Paperclip className="h-3 w-3" />{attachmentCount}
            </Badge>
          )}
        </div>
        {previewText !== null && (
          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">{previewText}</p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

export function TemplatesPage() {
  const { data: templates, isError, isLoading, refetch, error } = useTemplates();
  const navigate = useNavigate();
  const t = useT();

  useBackButton();

  return (
    <div className="flex min-h-dvh flex-col bg-background">

      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-120 px-4 pb-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('templates.page_title') ?? 'Reply templates'}
              {!isLoading && templates.length > 0 && (
                <span className="font-normal text-muted-foreground"> • {templates.length}</span>
              )}
            </h1>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => { void navigate('/admin/templates/new'); }}
            aria-label={t('templates.create') ?? 'Create template'}
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
              <div key={i} className="flex flex-col gap-1.5 px-4 py-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <FetchError description={t('templates.load_error') ?? 'Failed to load the template list'} onRetry={refetch} error={error} />
        ) : templates.length === 0 ? (
          <Empty className="border-none">
            <EmptyHeader>
              <EmptyMedia variant="icon"><Plus /></EmptyMedia>
              <EmptyTitle>{t('templates.empty_title')}</EmptyTitle>
              <EmptyDescription>{t('templates.empty_description')}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm" onClick={() => { void navigate('/admin/templates/new'); }}>{t('templates.create')}</Button>
            </EmptyContent>
          </Empty>
        ) : (
          <Card className="py-0">
            <CardContent className="p-0">
              {templates.map((tmpl, i) => (
                <React.Fragment key={tmpl.id}>
                  {i > 0 && <div className="mx-4 h-px bg-border" />}
                  <TemplateRow template={tmpl} onClick={() => { void navigate(`/admin/templates/${tmpl.id}`); }} />
                </React.Fragment>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
}
