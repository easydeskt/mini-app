import type { ReactNode } from 'react';

export function withAgent(label: string, agentName: string | null, labelClassName?: string): ReactNode {
  if (!agentName) return labelClassName ? <span className={labelClassName}>{label}</span> : label;
  return <><span className={labelClassName}>{label}</span><span className="font-normal text-muted-foreground"> • {agentName}</span></>;
}
