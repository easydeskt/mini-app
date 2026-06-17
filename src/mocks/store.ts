import type { ApiAgentResponse } from '@/api/agents';
import type { ApiChannelResponse } from '@/api/channels';
import type { MeResponse } from '@/api/me';
import type { ApiTagResponse } from '@/api/tags';
import type { ApiTemplateResponse } from '@/api/templates';
import type { ApiTicketResponse } from '@/api/tickets';
import type { ApiVaultSecretResponse } from '@/api/vault';
import type { WorkspaceResponse } from '@/api/workspace';
import {
  MOCK_AGENTS,
  MOCK_CHANNELS,
  MOCK_ME,
  MOCK_TAGS,
  MOCK_TEMPLATES,
  MOCK_TICKETS,
  MOCK_VAULT_SECRETS,
  MOCK_WORKSPACE,
} from './data';

const STORE_KEY = 'easydesk_mock_state_v1';

type MockState = {
  agents: ApiAgentResponse[];
  channels: ApiChannelResponse[];
  meAgentId: string;
  nextId: Record<string, number>;
  tags: ApiTagResponse[];
  templates: ApiTemplateResponse[];
  tickets: ApiTicketResponse[];
  vault: ApiVaultSecretResponse[];
};

function defaultState(): MockState {
  return {
    agents: structuredClone(MOCK_AGENTS),
    channels: structuredClone(MOCK_CHANNELS),
    meAgentId: MOCK_AGENTS[0].id,
    nextId: { channels: 1000, tags: 1000, templates: 1000, vault: 1000 },
    tags: structuredClone(MOCK_TAGS),
    templates: structuredClone(MOCK_TEMPLATES),
    tickets: structuredClone(MOCK_TICKETS),
    vault: structuredClone(MOCK_VAULT_SECRETS),
  };
}

function load(): MockState {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw) as MockState;
  } catch { /* ignore */ }
  return defaultState();
}

let state = load();

function persist(): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

function nextId(entity: string): number {
  const id = state.nextId[entity] ?? 1000;
  state.nextId[entity] = id + 1;
  persist();
  return id;
}

const now = () => new Date().toISOString();

export const store = {
  reset(): void {
    state = defaultState();
    persist();
  },

  // --- Me / Workspace (dynamic) ---

  getMe(): MeResponse {
    const agent = state.agents.find(a => a.id === state.meAgentId) ?? state.agents[0];
    const myTickets = state.tickets.filter(t => t.assigned_agent_id === state.meAgentId);
    const today = new Date().toDateString();
    const resolvedToday = state.tickets.filter(
      t => t.resolved_at && new Date(t.resolved_at).toDateString() === today,
    ).length;
    return {
      agent,
      avg_response_minutes: MOCK_ME.avg_response_minutes,
      in_progress_ticket_count: myTickets.filter(t => t.status === 'IN_PROGRESS').length,
      open_ticket_count: state.tickets.filter(t => t.status === 'OPEN').length,
      resolved_today: resolvedToday,
    };
  },

  getWorkspace(): WorkspaceResponse {
    const counters = { open: 0, in_progress: 0, resolved: 0, closed: 0, merged: 0 };
    for (const t of state.tickets) {
      const key = t.status.toLowerCase() as keyof typeof counters;
      if (key in counters) counters[key]++;
    }
    return { ...MOCK_WORKSPACE, metrics: { ...MOCK_WORKSPACE.metrics, tickets_counters: counters } };
  },

  // --- Agents ---

  getAgents(activeOnly: boolean): ApiAgentResponse[] {
    return activeOnly ? state.agents.filter(a => a.is_active) : state.agents;
  },

  getAgent(id: string): ApiAgentResponse | null {
    return state.agents.find(a => a.id === id) ?? null;
  },

  patchAgent(id: string, patch: { display_name?: string; is_active?: boolean; role?: string }): ApiAgentResponse | null {
    const idx = state.agents.findIndex(a => a.id === id);
    if (idx < 0) return null;
    state.agents[idx] = { ...state.agents[idx], ...patch, updated_at: now() };
    persist();
    return state.agents[idx];
  },

  // --- Tags ---

  getTags(): ApiTagResponse[] { return state.tags; },

  createTag(name: string, color: number | null): ApiTagResponse {
    const tag: ApiTagResponse = { id: nextId('tags'), name, color, created_at: now() };
    state.tags.push(tag);
    persist();
    return tag;
  },

  updateTag(id: number, name: string, color: number | null): ApiTagResponse | null {
    const idx = state.tags.findIndex(t => t.id === id);
    if (idx < 0) return null;
    state.tags[idx] = { ...state.tags[idx], name, color };
    persist();
    return state.tags[idx];
  },

  deleteTag(id: number): boolean {
    const idx = state.tags.findIndex(t => t.id === id);
    if (idx < 0) return false;
    state.tags.splice(idx, 1);
    persist();
    return true;
  },

  // --- Templates ---

  getTemplates(): ApiTemplateResponse[] { return state.templates; },

  getTemplate(id: number): ApiTemplateResponse | null {
    return state.templates.find(t => t.id === id) ?? null;
  },

  createTemplate(humanName: string, content: string | null): ApiTemplateResponse {
    const template: ApiTemplateResponse = { id: nextId('templates'), human_name: humanName, content, attachments: [] };
    state.templates.push(template);
    persist();
    return template;
  },

  updateTemplate(id: number, humanName: string, content: string | null): ApiTemplateResponse | null {
    const idx = state.templates.findIndex(t => t.id === id);
    if (idx < 0) return null;
    state.templates[idx] = { ...state.templates[idx], human_name: humanName, content };
    persist();
    return state.templates[idx];
  },

  deleteTemplate(id: number): boolean {
    const idx = state.templates.findIndex(t => t.id === id);
    if (idx < 0) return false;
    state.templates.splice(idx, 1);
    persist();
    return true;
  },

  // --- Channels ---

  getChannels(enabledOnly: boolean): ApiChannelResponse[] {
    return enabledOnly ? state.channels.filter(c => c.is_enabled) : state.channels;
  },

  getChannel(id: number): ApiChannelResponse | null {
    return state.channels.find(c => c.id === id) ?? null;
  },

  createChannel(brand: string, displayName: string, config: Record<string, unknown>): ApiChannelResponse {
    const channel: ApiChannelResponse = {
      id: nextId('channels'),
      brand,
      display_name: displayName,
      is_enabled: true,
      config,
      created_at: now(),
    };
    state.channels.push(channel);
    persist();
    return channel;
  },

  updateChannel(id: number, displayName: string, isEnabled: boolean, config: Record<string, unknown>): ApiChannelResponse | null {
    const idx = state.channels.findIndex(c => c.id === id);
    if (idx < 0) return null;
    state.channels[idx] = { ...state.channels[idx], display_name: displayName, is_enabled: isEnabled, config };
    persist();
    return state.channels[idx];
  },

  deleteChannel(id: number): boolean {
    const idx = state.channels.findIndex(c => c.id === id);
    if (idx < 0) return false;
    state.channels.splice(idx, 1);
    persist();
    return true;
  },

  // --- Vault ---

  getSecrets(): ApiVaultSecretResponse[] { return state.vault; },

  getSecret(id: number): ApiVaultSecretResponse | null {
    return state.vault.find(s => s.id === id) ?? null;
  },

  createSecret(name: string, description: string | null): ApiVaultSecretResponse {
    const secret: ApiVaultSecretResponse = { id: nextId('vault'), name, description, updated_at: now() };
    state.vault.push(secret);
    persist();
    return secret;
  },

  updateSecret(id: number, description: string | null): ApiVaultSecretResponse | null {
    const idx = state.vault.findIndex(s => s.id === id);
    if (idx < 0) return null;
    state.vault[idx] = { ...state.vault[idx], description, updated_at: now() };
    persist();
    return state.vault[idx];
  },

  deleteSecret(id: number): boolean {
    const idx = state.vault.findIndex(s => s.id === id);
    if (idx < 0) return false;
    state.vault.splice(idx, 1);
    persist();
    return true;
  },

  // --- Tickets ---

  getTickets(filters: { assignedAgentId?: string; priority?: string; status?: string; tagId?: number }): ApiTicketResponse[] {
    let result = state.tickets;
    if (filters.assignedAgentId) result = result.filter(t => t.assigned_agent_id === filters.assignedAgentId);
    if (filters.priority) result = result.filter(t => t.priority === filters.priority);
    if (filters.status) result = result.filter(t => t.status === filters.status);
    if (filters.tagId !== undefined) result = result.filter(t => t.tags.some(tag => tag.id === filters.tagId));
    return [...result].sort((a, b) => b.last_message_at.localeCompare(a.last_message_at));
  },

  getTicket(id: number): ApiTicketResponse | null {
    return state.tickets.find(t => t.id === id) ?? null;
  },

  assignTicket(id: number, agentId: string): boolean {
    const idx = state.tickets.findIndex(t => t.id === id);
    if (idx < 0) return false;
    const ticket = state.tickets[idx];
    state.tickets[idx] = {
      ...ticket,
      assigned_agent_id: agentId,
      assigned_at: now(),
      status: ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status,
    };
    persist();
    return true;
  },

  freeTicket(id: number): boolean {
    const idx = state.tickets.findIndex(t => t.id === id);
    if (idx < 0) return false;
    state.tickets[idx] = { ...state.tickets[idx], assigned_agent_id: null, assigned_at: null, status: 'OPEN' };
    persist();
    return true;
  },

  resolveTicket(id: number): boolean {
    const idx = state.tickets.findIndex(t => t.id === id);
    if (idx < 0) return false;
    state.tickets[idx] = { ...state.tickets[idx], status: 'RESOLVED', resolved_at: now() };
    persist();
    return true;
  },

  closeTicket(id: number): boolean {
    const idx = state.tickets.findIndex(t => t.id === id);
    if (idx < 0) return false;
    state.tickets[idx] = { ...state.tickets[idx], status: 'CLOSED', closed_at: now() };
    persist();
    return true;
  },

  reopenTicket(id: number): boolean {
    const idx = state.tickets.findIndex(t => t.id === id);
    if (idx < 0) return false;
    state.tickets[idx] = {
      ...state.tickets[idx],
      status: 'IN_PROGRESS',
      assigned_agent_id: state.meAgentId,
      assigned_at: now(),
      resolved_at: null,
      closed_at: null,
    };
    persist();
    return true;
  },

  setTicketPriority(id: number, priority: string | null): boolean {
    const idx = state.tickets.findIndex(t => t.id === id);
    if (idx < 0) return false;
    state.tickets[idx] = { ...state.tickets[idx], priority };
    persist();
    return true;
  },

  setTicketTags(id: number, tagIds: number[]): boolean {
    const idx = state.tickets.findIndex(t => t.id === id);
    if (idx < 0) return false;
    const tags = tagIds
      .map(tid => state.tags.find(t => t.id === tid))
      .filter((t): t is ApiTagResponse => t !== undefined);
    state.tickets[idx] = { ...state.tickets[idx], tags };
    persist();
    return true;
  },

  mergeTicket(id: number, targetId: number): boolean {
    const idx = state.tickets.findIndex(t => t.id === id);
    if (idx < 0) return false;
    state.tickets[idx] = {
      ...state.tickets[idx],
      status: 'MERGED',
      merged_at: now(),
      merged_into_ticket_id: targetId,
    };
    persist();
    return true;
  },
};
