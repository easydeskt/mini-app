import { cn } from '@/lib/utils';
import { extractTagRgb, tagTextColor } from '@/utils/color';

export { extractTagRgb, tagTextColor };

type TagBadgeProps = {
  className?: string;
  color: number | null;
  name: string;
};

export function TagBadge({ className, color, name }: TagBadgeProps) {
  if (color === null) {
    return (
      <span className={cn('inline-flex shrink-0 items-center whitespace-nowrap rounded-md bg-zinc-100 px-1.75 text-[11px] font-medium text-foreground dark:bg-zinc-800', className)}>
        {name}
      </span>
    );
  }
  const [r, g, b] = extractTagRgb(color);
  return (
    <span
      className={cn('inline-flex shrink-0 items-center whitespace-nowrap rounded-md px-1.75 text-[11px] font-medium', className)}
      style={{ backgroundColor: `rgba(${r}, ${g}, ${b}, 0.13)`, color: tagTextColor(r, g, b) }}
    >
      {name}
    </span>
  );
}
