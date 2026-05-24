import { useState } from 'react';
import React from 'react';

import { initData, useSignal } from '@telegram-apps/sdk-react';
import { UserPlus, UserRoundPen } from 'lucide-react';
import { useNavigate } from 'react-router';

import { AgentAddSheet } from '@/components/admin/AgentAddSheet';
import { AgentEditSheet } from '@/components/admin/AgentEditSheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FetchError } from '@/components/ui/list-error';
import { Skeleton } from '@/components/ui/skeleton';
import { useAgents } from '@/hooks/queries/useAgents';
import { useCurrentAgent } from '@/hooks/queries/useCurrentAgent';
import { useWorkspace } from '@/hooks/queries/useWorkspace';
import { useBackButton } from '@/hooks/useBackButton';
import { useT } from '@/hooks/useT';
import type { Agent } from '@/types/agent';

type AgentSectionProps = { title: string; count?: number; children: React.ReactNode };

function AgentSection({ title, count, children }: AgentSectionProps) {
  return (
    <div>
      <p className="mb-1.5 px-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {title}
        {count !== undefined && <span className="font-normal"> • {count}</span>}
      </p>
      <Card className="py-0">
        <CardContent className="p-0">{children}</CardContent>
      </Card>
    </div>
  );
}

type AgentRowProps = { agent: Agent; isSelf?: boolean; photoUrl?: string; onClick: () => void; onEdit: () => void };

function AgentRow({ agent, isSelf, photoUrl, onClick, onEdit }: AgentRowProps) {
  const t = useT();
  return (
    <div className="flex w-full items-stretch">
      <button
        type="button"
        onClick={onClick}
        className="flex flex-1 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 active:bg-muted"
      >
        <Avatar className="h-9 w-9">
          {photoUrl && <AvatarImage src={photoUrl} />}
          <AvatarFallback className="text-sm">{agent.initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium">{agent.name}</p>
            {isSelf && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium leading-none text-primary">
                {t('agents.you_badge')}
              </span>
            )}
          </div>
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
  const { data: workspace } = useWorkspace();
  const tgUser = useSignal(initData.user);
  const t = useT();

  const tgUsername = tgUser?.username?.toLowerCase();
  const photoUrlFor = (agent: Agent) =>
    tgUsername && agent.username.toLowerCase() === tgUsername ? tgUser?.photo_url : undefined;

  const isLoading = agentsLoading || currentAgentLoading;

  const agentUrl = (id: string) => `/admin/agents/${id}`;

  const [editTarget, setEditTarget] = useState<Agent | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  useBackButton();

  const superadminId = workspace?.superadmin_id ?? null;
  const owner = superadminId ? agents.find(a => a.id === superadminId) : null;
  const admins = agents.filter(a => a.role === 'ADMIN' && a.id !== superadminId);
  const operators = agents.filter(a => a.role === 'OPERATOR');

  return (
    <div className="flex min-h-dvh flex-col bg-background">

      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-120 px-4 pb-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('agents.page_title') ?? 'Agents'}
              {!isLoading && agents.length > 0 && (
                <span className="font-normal text-muted-foreground"> • {agents.length}</span>
              )}
            </h1>
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

      <div className="mx-auto flex w-full max-w-120 flex-1 flex-col space-y-4 px-4 py-4">
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
            {owner && (
              <AgentSection title={(t('agents.section_owner') ?? 'Owner').toUpperCase()}>
                <AgentRow
                  agent={owner}
                  isSelf={owner.id === currentAgent?.id}
                  photoUrl={photoUrlFor(owner)}
                  onClick={() => { void navigate(agentUrl(owner.id)); }}
                  onEdit={() => { setEditTarget(owner); setEditOpen(true); }}
                />
              </AgentSection>
            )}

            {admins.length > 0 && (
              <AgentSection title={(t('agents.section_admins') ?? 'Admins').toUpperCase()} count={admins.length}>
                {admins.map((agent, i) => (
                  <React.Fragment key={agent.id}>
                    {i > 0 && <div className="mx-4 h-px bg-border" />}
                    <AgentRow
                      agent={agent}
                      isSelf={agent.id === currentAgent?.id}
                      photoUrl={photoUrlFor(agent)}
                      onClick={() => { void navigate(agentUrl(agent.id)); }}
                      onEdit={() => { setEditTarget(agent); setEditOpen(true); }}
                    />
                  </React.Fragment>
                ))}
              </AgentSection>
            )}

            {operators.length > 0 && (
              <AgentSection title={(t('agents.section_operators') ?? 'Operators').toUpperCase()} count={operators.length}>
                {operators.map((agent, i) => (
                  <React.Fragment key={agent.id}>
                    {i > 0 && <div className="mx-4 h-px bg-border" />}
                    <AgentRow
                      agent={agent}
                      photoUrl={photoUrlFor(agent)}
                      onClick={() => { void navigate(agentUrl(agent.id)); }}
                      onEdit={() => { setEditTarget(agent); setEditOpen(true); }}
                    />
                  </React.Fragment>
                ))}
              </AgentSection>
            )}
          </>
        )}
      </div>

      <AgentEditSheet agent={editTarget} open={editOpen} onOpenChange={setEditOpen} isSelf={editTarget?.id === currentAgent?.id} isOwner={editTarget?.id === superadminId} />
      <AgentAddSheet open={inviteOpen} onOpenChange={setInviteOpen} />

    </div>
  );
}
