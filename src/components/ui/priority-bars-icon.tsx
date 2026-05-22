import type { TicketPriority } from '@/types/ticket';

const PRIORITY_COLOR: Record<TicketPriority, string> = {
  HIGH: '#ef4444',
  LOW: '#22c55e',
  MEDIUM: '#f59e0b',
};

const PRIORITY_ACTIVE_BARS: Record<TicketPriority, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };

type PriorityBarsIconProps = { priority: TicketPriority };

export function PriorityBarsIcon({ priority }: PriorityBarsIconProps) {
  const color = PRIORITY_COLOR[priority];
  const active = PRIORITY_ACTIVE_BARS[priority];
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">
      <rect x="0" y="7" width="2" height="4" rx="0.6" fill={color} fillOpacity={active >= 1 ? 1 : 0.2} />
      <rect x="4" y="4" width="2" height="7" rx="0.6" fill={color} fillOpacity={active >= 2 ? 1 : 0.2} />
      <rect x="8" y="1" width="2" height="10" rx="0.6" fill={color} fillOpacity={active >= 3 ? 1 : 0.2} />
    </svg>
  );
}
