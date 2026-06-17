import { MOCK_CHANNEL_PROVIDERS } from './data';
import { store } from './store';

export const MOCK_ORIGIN = 'mock://demo';

function ok(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function noContent(): Response {
  return new Response(null, { status: 204 });
}

function created(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}

function notFound(): Response {
  return new Response(JSON.stringify({ error_message: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
}

function parseBody(init?: RequestInit): Record<string, unknown> {
  if (!init?.body || typeof init.body !== 'string') return {};
  try { return JSON.parse(init.body) as Record<string, unknown>; } catch { return {}; }
}

function handleMockRequest(url: string, method: string, init?: RequestInit): Response | null {
  const [pathRaw, queryString] = url.slice(MOCK_ORIGIN.length).split('?');
  const path = pathRaw;
  const params = new URLSearchParams(queryString ?? '');
  const body = parseBody(init);

  // GET /me
  if (method === 'GET' && path === '/me') return ok(store.getMe());

  // GET /workspace
  if (method === 'GET' && path === '/workspace') return ok(store.getWorkspace());

  // GET /agents
  if (method === 'GET' && path === '/agents') {
    const activeOnly = params.get('activeOnly') !== 'false';
    return ok(store.getAgents(activeOnly));
  }

  // GET /agents/:id   PATCH /agents/:id
  const agentMatch = path.match(/^\/agents\/([^/]+)$/);
  if (agentMatch) {
    const id = agentMatch[1];
    if (method === 'GET') {
      const agent = store.getAgent(id);
      return agent ? ok(agent) : notFound();
    }
    if (method === 'PATCH') {
      const result = store.patchAgent(id, body as { display_name?: string; is_active?: boolean; role?: string });
      return result ? ok(result) : notFound();
    }
  }

  // GET /tags
  if (method === 'GET' && path === '/tags') return ok(store.getTags());

  // POST /tags
  if (method === 'POST' && path === '/tags') {
    return ok(store.createTag(body.name as string, (body.color ?? null) as number | null));
  }

  // PUT /tags/:id   DELETE /tags/:id
  const tagMatch = path.match(/^\/tags\/(\d+)$/);
  if (tagMatch) {
    const id = Number(tagMatch[1]);
    if (method === 'PUT') {
      const result = store.updateTag(id, body.name as string, (body.color ?? null) as number | null);
      return result ? ok(result) : notFound();
    }
    if (method === 'DELETE') {
      return store.deleteTag(id) ? noContent() : notFound();
    }
  }

  // GET /tickets
  if (method === 'GET' && path === '/tickets') {
    const tagId = params.has('tagId') ? Number(params.get('tagId')) : undefined;
    return ok(store.getTickets({
      assignedAgentId: params.get('assignedAgentId') ?? undefined,
      priority: params.get('priority') ?? undefined,
      status: params.get('status') ?? undefined,
      tagId,
    }));
  }

  // GET /tickets/:id
  const ticketMatch = path.match(/^\/tickets\/(\d+)$/);
  if (method === 'GET' && ticketMatch) {
    const ticket = store.getTicket(Number(ticketMatch[1]));
    return ticket ? ok(ticket) : notFound();
  }

  // PATCH /tickets/:id/attributes
  if (method === 'PATCH' && /^\/tickets\/\d+\/attributes$/.test(path)) return noContent();

  // GET|POST /tickets/:id/notes
  const ticketNotesMatch = path.match(/^\/tickets\/(\d+)\/notes$/);
  if (ticketNotesMatch) {
    const id = Number(ticketNotesMatch[1]);
    if (method === 'GET') {
      const ticket = store.getTicket(id);
      if (!ticket) return notFound();
      const scope = params.get('scope') ?? 'all';
      const notes = ticket.notes ?? [];
      return ok(scope === 'all' ? notes : notes.filter(n => n.scope === scope));
    }
    if (method === 'POST') {
      const note = store.addNote(id, body.scope as string, body.text as string);
      return note ? created(note) : notFound();
    }
  }

  // PUT|DELETE /tickets/:id/notes/:noteId
  const ticketNoteMatch = path.match(/^\/tickets\/(\d+)\/notes\/(\d+)$/);
  if (ticketNoteMatch) {
    const ticketId = Number(ticketNoteMatch[1]);
    const noteId = Number(ticketNoteMatch[2]);
    if (method === 'PUT') {
      const note = store.updateNote(ticketId, noteId, body.scope as string, body.text as string);
      return note ? ok(note) : notFound();
    }
    if (method === 'DELETE') {
      return store.deleteNote(ticketId, noteId) ? noContent() : notFound();
    }
  }

  // POST /tickets/:id/<action>
  const ticketActionMatch = path.match(/^\/tickets\/(\d+)\/([^/]+)$/);
  if (method === 'POST' && ticketActionMatch) {
    const id = Number(ticketActionMatch[1]);
    switch (ticketActionMatch[2]) {
      case 'assign':   store.assignTicket(id, body.agent_id as string); return noContent();
      case 'free':     store.freeTicket(id);                             return noContent();
      case 'resolve':  store.resolveTicket(id);                          return noContent();
      case 'close':    store.closeTicket(id);                            return noContent();
      case 'reopen':   store.reopenTicket(id);                           return noContent();
      case 'priority': store.setTicketPriority(id, body.priority as string | null); return noContent();
      case 'tags':     store.setTicketTags(id, body.tag_ids as number[]); return noContent();
      case 'merge':    store.mergeTicket(id, body.target_ticket_id as number); return noContent();
    }
  }

  // GET /channels/providers
  if (method === 'GET' && path === '/channels/providers') return ok(MOCK_CHANNEL_PROVIDERS);

  // GET /channels   POST /channels
  if (path === '/channels') {
    if (method === 'GET') {
      const enabledOnly = params.get('enabledOnly') === 'true';
      return ok(store.getChannels(enabledOnly));
    }
    if (method === 'POST') {
      return ok(store.createChannel(body.brand as string, body.display_name as string, body.config as Record<string, unknown>));
    }
  }

  // GET /channels/:id   PUT /channels/:id   DELETE /channels/:id
  const channelMatch = path.match(/^\/channels\/(\d+)$/);
  if (channelMatch) {
    const id = Number(channelMatch[1]);
    if (method === 'GET') {
      const channel = store.getChannel(id);
      return channel ? ok(channel) : notFound();
    }
    if (method === 'PUT') {
      const result = store.updateChannel(id, body.display_name as string, body.is_enabled as boolean, body.config as Record<string, unknown>);
      return result ? ok(result) : notFound();
    }
    if (method === 'DELETE') {
      return store.deleteChannel(id) ? noContent() : notFound();
    }
  }

  // GET /templates   POST /templates
  if (path === '/templates') {
    if (method === 'GET') return ok(store.getTemplates());
    if (method === 'POST') {
      return ok(store.createTemplate(body.human_name as string, (body.content ?? null) as string | null));
    }
  }

  // GET /templates/:id   PUT /templates/:id   DELETE /templates/:id
  const templateMatch = path.match(/^\/templates\/(\d+)$/);
  if (templateMatch) {
    const id = Number(templateMatch[1]);
    if (method === 'GET') {
      const template = store.getTemplate(id);
      return template ? ok(template) : notFound();
    }
    if (method === 'PUT') {
      const result = store.updateTemplate(id, body.human_name as string, (body.content ?? null) as string | null);
      return result ? ok(result) : notFound();
    }
    if (method === 'DELETE') {
      return store.deleteTemplate(id) ? noContent() : notFound();
    }
  }

  // Template attachments — not mocked (file uploads)
  if (/^\/templates\/\d+\/attachments/.test(path)) return noContent();

  // GET /vault   POST /vault
  if (path === '/vault') {
    if (method === 'GET') return ok(store.getSecrets());
    if (method === 'POST') {
      return ok(store.createSecret(body.name as string, (body.description ?? null) as string | null));
    }
  }

  // GET /vault/:id   PUT /vault/:id   DELETE /vault/:id
  const vaultMatch = path.match(/^\/vault\/(\d+)$/);
  if (vaultMatch) {
    const id = Number(vaultMatch[1]);
    if (method === 'GET') {
      const secret = store.getSecret(id);
      return secret ? ok(secret) : notFound();
    }
    if (method === 'PUT') {
      const result = store.updateSecret(id, (body.description ?? null) as string | null);
      return result ? ok(result) : notFound();
    }
    if (method === 'DELETE') {
      return store.deleteSecret(id) ? noContent() : notFound();
    }
  }

  return null;
}

let interceptorInstalled = false;

export function setupMockInterceptor(): void {
  if (interceptorInstalled) return;
  interceptorInstalled = true;

  const originalFetch = globalThis.fetch.bind(globalThis);

  globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : (input as Request).url;

    if (url.startsWith(MOCK_ORIGIN)) {
      const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
      const response = handleMockRequest(url, method, init);
      if (response) return Promise.resolve(response);
    }

    return originalFetch(input, init);
  };
}
