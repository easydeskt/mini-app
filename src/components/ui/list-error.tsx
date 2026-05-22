import { GlobeOff, RotateCcw, TriangleAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { useT } from '@/hooks/useT';

type FetchErrorProps = {
  description: string;
  onRetry: () => void;
  error?: unknown;
};

export function FetchError({ description, onRetry, error }: FetchErrorProps) {
  const t = useT();

  const isNetwork = error instanceof TypeError && !navigator.onLine;
  const isServer = error instanceof TypeError && navigator.onLine;

  const icon = (isNetwork || isServer) ? <GlobeOff /> : <TriangleAlert />;
  const title = isNetwork
    ? (t('common.list_error_network_title') ?? 'Network error')
    : isServer
      ? (t('common.list_error_server_title') ?? 'Server unavailable')
      : (t('common.list_error_title') ?? 'An error occurred');

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" size="sm" className="gap-2" onClick={onRetry}>
          <RotateCcw className="h-3.5 w-3.5" />
          {t('common.list_error_retry') ?? 'Retry'}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
