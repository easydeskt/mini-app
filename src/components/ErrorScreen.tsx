import { type ReactNode } from 'react';

import { TriangleAlert } from 'lucide-react';

import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { cn } from '@/lib/utils';

type ErrorScreenProps = {
  title: string;
  description?: string;
  descriptionClassName?: string;
  action?: ReactNode;
};

export function ErrorScreen({ title, description, descriptionClassName, action }: ErrorScreenProps) {
  return (
    <Empty className="min-h-dvh">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlert />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description && (
          <EmptyDescription className={cn('wrap-break-word', descriptionClassName)}>
            {description}
          </EmptyDescription>
        )}
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  );
}
