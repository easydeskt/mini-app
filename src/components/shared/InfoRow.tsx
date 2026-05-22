import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type InfoRowProps = {
  label: string;
  loading?: boolean;
  mono?: boolean;
  skeletonWidth?: string;
  unset?: boolean;
  value?: string;
};

export function InfoRow({ label, loading, mono, skeletonWidth = 'w-32', unset, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      {loading ? (
        <Skeleton className={`h-4 ${skeletonWidth}`} />
      ) : (
        <span className={cn('text-right text-sm', mono && 'font-mono', unset && 'text-muted-foreground')}>
          {value ?? ''}
        </span>
      )}
    </div>
  );
}
