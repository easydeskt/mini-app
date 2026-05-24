import { useEffect, useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, UserRound, UserRoundPen } from 'lucide-react';
import { toast } from 'sonner';

import { patchAgent } from '@/api/agents';
import { queryKeys } from '@/api/query-keys';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useT } from '@/hooks/useT';
import type { Agent } from '@/types/agent';

type AgentEditSheetProps = {
  agent: Agent | null;
  isSelf?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AgentEditSheet({ agent, isSelf = false, open, onOpenChange }: AgentEditSheetProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'OPERATOR'>('OPERATOR');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const t = useT();

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: () => patchAgent(agent!.id, { display_name: name.trim(), role: role.toLowerCase() }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.agents.all });
      onOpenChange(false);
    },
    onError: () => {
      toast.error(t('agents.update_error') ?? 'Failed to update agent');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: () => patchAgent(agent!.id, { is_active: false }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.agents.all });
      setDeleteOpen(false);
      onOpenChange(false);
    },
    onError: () => {
      toast.error(t('agents.deactivate_error') ?? 'Failed to deactivate agent');
    },
  });

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setRole(agent.role);
    }
  }, [agent]);

  if (!agent) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-xl gap-1" showCloseButton={false}>
          <SheetHeader className="flex-row items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-base">
              <UserRoundPen className="h-5 w-5 shrink-0" />
              {t('agents.edit_sheet_title') ?? 'Edit agent'}
            </SheetTitle>

            {!isSelf && (
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 rounded-full text-destructive hover:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </SheetHeader>

          <div className="flex flex-col gap-4 px-4 pb-4">

            <InputGroup>
              <InputGroupInput
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t('agents.edit_field_name') ?? 'Name'}
              />
              <InputGroupAddon>
                <UserRound className="h-4 w-4" />
              </InputGroupAddon>
            </InputGroup>

            {isSelf && (
              <p className="rounded-lg border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
                {t('agents.edit_self_note')}
              </p>
            )}

            {!isSelf && (
              <RadioGroup
                value={role}
                onValueChange={v => setRole(v as 'ADMIN' | 'OPERATOR')}
                className="gap-0 overflow-hidden rounded-lg border"
              >
                <label
                  htmlFor="role-admin"
                  className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 active:bg-muted"
                >
                  <RadioGroupItem value="ADMIN" id="role-admin" />
                  <div>
                    <p className="text-sm">{t('agents.edit_role_admin_label') ?? 'Administrator'}</p>
                    <p className="text-xs text-muted-foreground">{t('agents.edit_role_admin_description') ?? 'Manage agents, tags and templates'}</p>
                  </div>
                </label>
                <div className="h-px bg-border" />
                <label
                  htmlFor="role-operator"
                  className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 active:bg-muted"
                >
                  <RadioGroupItem value="OPERATOR" id="role-operator" />
                  <div>
                    <p className="text-sm">{t('agents.edit_role_operator_label') ?? 'Operator'}</p>
                    <p className="text-xs text-muted-foreground">{t('agents.edit_role_operator_description') ?? 'Handle tickets and clients'}</p>
                  </div>
                </label>
              </RadioGroup>
            )}

            <Button
              className="w-full"
              disabled={name.trim() === '' || updateMutation.isPending || deactivateMutation.isPending}
              onClick={() => updateMutation.mutate()}
            >
              {t('agents.edit_save') ?? 'Save'}
            </Button>

          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('agents.deactivate_confirm_title') ?? 'Deactivate this agent?'}</AlertDialogTitle>
            <AlertDialogDescription>{t('agents.deactivate_confirm_description') ?? 'The agent will no longer be able to access the workspace.'}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('agents.delete_cancel') ?? 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deactivateMutation.isPending}
              onClick={() => deactivateMutation.mutate()}
            >
              {t('agents.deactivate_confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
