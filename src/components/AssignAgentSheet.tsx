import { Fragment } from 'react';

import { UserPlus } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useT } from '@/hooks/useT';
import { useAgents } from '@/hooks/queries/useAgents';
import type { Agent } from '@/types/agent';

type AssignAgentSheetProps = {
  currentAgentId: string | null;
  isPending: boolean;
  open: boolean;
  onAssign: (agentId: string) => void;
  onOpenChange: (open: boolean) => void;
};

type AgentRowProps = {
  agent: Agent;
  disabled?: boolean;
  onClick?: () => void;
};

function AgentRow({ agent, disabled, onClick }: AgentRowProps) {
  const inner = (
    <div className="flex items-center gap-3 px-4 py-3">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-zinc-200 text-xs font-semibold dark:bg-zinc-700">
          {agent.initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{agent.name}</p>
        {agent.username && (
          <p className="truncate text-xs text-muted-foreground">@{agent.username}</p>
        )}
      </div>
      {agent.online && (
        <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
      )}
    </div>
  );

  if (!onClick) return <div>{inner}</div>;

  return (
    <button
      type="button"
      className="w-full text-left outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted active:bg-muted disabled:opacity-50"
      disabled={disabled}
      onClick={onClick}
    >
      {inner}
    </button>
  );
}

export function AssignAgentSheet({ currentAgentId, isPending, open, onAssign, onOpenChange }: AssignAgentSheetProps) {
  const t = useT();
  const { data: agents, isLoading } = useAgents();
  const currentAgent = agents.find(a => a.id === currentAgentId) ?? null;
  const otherAgents = agents.filter(a => a.id !== currentAgentId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-xl gap-1" showCloseButton={false}>
        <SheetHeader className="flex-row items-center justify-between">
          <SheetTitle className="flex items-center gap-2 text-base">
            <UserPlus className="h-5 w-5 shrink-0" />
            {t('tickets.assign_sheet_title')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-3 px-4 pb-4">
          {currentAgent && (
            <div>
              <p className="mb-1.5 px-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">{t('tickets.assign_current_section')}</p>
              <div className="overflow-hidden rounded-lg border">
                <AgentRow agent={currentAgent} />
              </div>
            </div>
          )}
          <div>
            <p className="mb-1.5 px-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {currentAgent ? t('tickets.assign_reassign_section') : t('tickets.assign_select_section')}
            </p>
            {isLoading ? (
              <div className="rounded-lg border py-6 text-center text-sm text-muted-foreground">{t('tickets.assign_loading')}</div>
            ) : otherAgents.length === 0 ? (
              <div className="rounded-lg border py-6 text-center text-sm text-muted-foreground">{t('tickets.assign_no_others')}</div>
            ) : (
              <div className="overflow-hidden rounded-lg border">
                {otherAgents.map((agent, idx) => (
                  <Fragment key={agent.id}>
                    {idx > 0 && <div className="h-px bg-border" />}
                    <AgentRow
                      agent={agent}
                      disabled={isPending}
                      onClick={() => { onAssign(agent.id); onOpenChange(false); }}
                    />
                  </Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
