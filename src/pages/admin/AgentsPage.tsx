import { useState } from 'react';
import React from 'react';

import { UserPlus, UserRoundPen } from 'lucide-react';
import { useNavigate } from 'react-router';

import { AgentAddSheet } from '@/components/admin/AgentAddSheet';
import { AgentEditSheet } from '@/components/admin/AgentEditSheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FetchError } from '@/components/ui/list-error';
import { Skeleton } from '@/components/ui/skeleton';
import { useAgents } from '@/hooks/queries/useAgents';
import { useBackButton } from '@/hooks/useBackButton';
import { useCurrentAgent } from '@/hooks/queries/useCurrentAgent';
import { useT } from '@/hooks/useT';
import { pluralizeRu } from '@/utils/formatters';
import type { Agent } from '@/types/agent';

type AgentSectionProps = { title: string; children: React.ReactNode };

function AgentSection({ title, children }: AgentSectionProps) {
  return (
    <div>
      <p className="mb-1.5 px-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
      <Card className="py-0">
        <CardContent className="p-0">{children}</CardContent>
      </Card>
    </div>
  );
}

type AgentRowProps = { agent: Agent; onClick: () => void; onEdit: () => void };

function AgentRow({ agent, onClick, onEdit }: AgentRowProps) {
  return (
    <div className="flex w-full items-stretch">
      <button
        type="button"
        onClick={onClick}
        className="flex flex-1 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 active:bg-muted"
      >
        <Avatar className="h-9 w-9">
          <AvatarFallback className="text-sm">{agent.initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{agent.name}</p>
          {agent.username && <p className="text-xs text-muted-foreground">@{agent.username}</p>}
        </div>
      </button>
      <div className="my-3 w-px bg-border/50" />
      <button
        type="button"
        onClick={onEdit}
        className="flex items-center justify-center px-4 transition-colors hover:bg-muted/50 active:bg-muted"
        aria-label="Редактировать агента"
      >
        <UserRoundPen className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}

export function AgentsPage() {
  const navigate = useNavigate();
  const { data: agents, isError: agentsError, isLoading: agentsLoading, refetch: refetchAgents, error: agentsFetchError } = useAgents();
  const { data: currentAgent, isLoading: currentAgentLoading } = useCurrentAgent();
  const t = useT();

  const isLoading = agentsLoading || currentAgentLoading;

  const agentUrl = (id: string) => id === currentAgent?.id ? '/agents/me' : `/agents/${id}`;

  const [editTarget, setEditTarget] = useState<Agent | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  useBackButton();

  const admins = agents.filter(a => a.role === 'ADMIN');
  const operators = agents.filter(a => a.role === 'OPERATOR');

  return (
    <div className="flex min-h-dvh flex-col bg-background">

      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-[480px] px-4 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('agents.page_title') ?? 'Agents'}</h1>
            {isLoading ? (
              <Skeleton className="mt-1 h-4 w-24" />
            ) : agents.length > 0 ? (
              <p className="text-sm text-muted-foreground">{pluralizeRu(agents.length, t('agents.count_one'), t('agents.count_few'), t('agents.count_many'))}</p>
            ) : null}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => setInviteOpen(true)}
            aria-label={t('agents.invite') ?? 'Invite agent'}
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col space-y-4 px-4 pb-8">
        {isLoading ? (
          <div className="space-y-0 overflow-hidden rounded-xl border bg-card">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : agentsError ? (
          <FetchError description={t('agents.load_error') ?? 'Failed to load the agent list'} onRetry={refetchAgents} error={agentsFetchError} />
        ) : (
          <>
            {admins.length > 0 && (
              <AgentSection title={(t('agents.section_admins') ?? 'Admins').toUpperCase()}>
                {admins.map((agent, i) => (
                  <React.Fragment key={agent.id}>
                    {i > 0 && <div className="mx-4 h-px bg-border" />}
                    <AgentRow
                      agent={agent}
                      onClick={() => { void navigate(agentUrl(agent.id)); }}
                      onEdit={() => { setEditTarget(agent); setEditOpen(true); }}
                    />
                  </React.Fragment>
                ))}
              </AgentSection>
            )}

            <AgentSection title={(t('agents.section_operators') ?? 'Operators').toUpperCase()}>
              {operators.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">{t('agents.no_operators') ?? 'No operators'}</div>
              ) : (
                operators.map((agent, i) => (
                  <React.Fragment key={agent.id}>
                    {i > 0 && <div className="mx-4 h-px bg-border" />}
                    <AgentRow
                      agent={agent}
                      onClick={() => { void navigate(agentUrl(agent.id)); }}
                      onEdit={() => { setEditTarget(agent); setEditOpen(true); }}
                    />
                  </React.Fragment>
                ))
              )}
            </AgentSection>
          </>
        )}
      </div>

      <AgentEditSheet agent={editTarget} open={editOpen} onOpenChange={setEditOpen} />
      <AgentAddSheet open={inviteOpen} onOpenChange={setInviteOpen} />

    </div>
  );
}
