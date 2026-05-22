import { RotateCcw, TriangleAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { useT } from '@/hooks/useT';

type FetchErrorProps = {
  description: string;
  onRetry: () => void;
};

export function FetchError({ description, onRetry }: FetchErrorProps) {
  const t = useT();
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlert />
        </EmptyMedia>
        <EmptyTitle>{t('common.list_error_title') ?? 'An error occurred'}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" size="sm" className="gap-2" onClick={onRetry}>
          <RotateCcw className="h-3.5 w-3.5" />
          {t('common.list_error_retry') ?? 'Try again'}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
