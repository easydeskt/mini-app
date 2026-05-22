import { type ReactNode } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { ErrorScreen } from '@/components/ErrorScreen';
import { useCurrentAgent } from '@/hooks/queries/useCurrentAgent';
import { useT } from '@/hooks/useT';

type AdminGuardProps = {
  children: ReactNode;
};

export function AdminGuard({ children }: AdminGuardProps) {
  const { data: agent, isLoading } = useCurrentAgent();
  const t = useT();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <div className="sticky top-0 z-10 bg-background/80 px-4 pb-3 pt-4 backdrop-blur-md">
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="space-y-4 px-4 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!agent || agent.role !== 'ADMIN') {
    return <ErrorScreen title={t('common.access_denied') ?? 'Access denied'} />;
  }

  return <>{children}</>;
}
