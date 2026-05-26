import { MOCK_AGENTS, MOCK_CHANNEL_PROVIDERS, MOCK_CHANNELS, MOCK_ME, MOCK_TAGS, MOCK_TEMPLATES, MOCK_TICKETS, MOCK_WORKSPACE } from './data';

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

function notFound(): Response {
  return new Response(JSON.stringify({ error_message: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
}

function handleMockRequest(url: string, method: string): Response | null {
  const path = url.slice(MOCK_ORIGIN.length).split('?')[0];

  // GET /me
  if (method === 'GET' && path === '/me') return ok(MOCK_ME);

  // GET /workspace
  if (method === 'GET' && path === '/workspace') return ok(MOCK_WORKSPACE);

  // GET /agents
  if (method === 'GET' && path === '/agents') return ok(MOCK_AGENTS);

  // GET /agents/:id
  const agentMatch = path.match(/^\/agents\/([^/]+)$/);
  if (method === 'GET' && agentMatch) {
    const agent = MOCK_AGENTS.find(a => a.id === agentMatch[1]);
    return agent ? ok(agent) : notFound();
  }

  // PATCH /agents/:id
  if (method === 'PATCH' && /^\/agents\/[^/]+$/.test(path)) return noContent();

  // GET /tags
  if (method === 'GET' && path === '/tags') return ok(MOCK_TAGS);

  // POST/PUT/DELETE /tags
  if (/^\/tags(\/\d+)?$/.test(path)) return noContent();

  // GET /tickets
  if (method === 'GET' && path === '/tickets') return ok([...MOCK_TICKETS].sort((a, b) => b.last_message_at.localeCompare(a.last_message_at)));

  // GET /tickets/:id
  const ticketMatch = path.match(/^\/tickets\/(\d+)$/);
  if (method === 'GET' && ticketMatch) {
    const ticket = MOCK_TICKETS.find(t => t.id === Number(ticketMatch[1]));
    return ticket ? ok(ticket) : notFound();
  }

  // POST /tickets/:id/* — mutations (assign, free, resolve, close, reopen, priority, tags, merge)
  if (method === 'POST' && /^\/tickets\/\d+\//.test(path)) return noContent();

  // PATCH /tickets/:id
  if (method === 'PATCH' && /^\/tickets\/\d+$/.test(path)) return noContent();

  // GET /channels/providers
  if (method === 'GET' && path === '/channels/providers') return ok(MOCK_CHANNEL_PROVIDERS);

  // GET /channels
  if (method === 'GET' && path === '/channels') return ok(MOCK_CHANNELS);

  // GET /channels/:id
  const channelMatch = path.match(/^\/channels\/(\d+)$/);
  if (method === 'GET' && channelMatch) {
    const channel = MOCK_CHANNELS.find(c => c.id === Number(channelMatch[1]));
    return channel ? ok(channel) : notFound();
  }

  // POST/PUT/DELETE /channels
  if (/^\/channels(\/\d+)?$/.test(path)) return noContent();

  // GET /templates
  if (method === 'GET' && path === '/templates') return ok(MOCK_TEMPLATES);

  // GET /templates/:id
  const templateMatch = path.match(/^\/templates\/(\d+)$/);
  if (method === 'GET' && templateMatch) {
    const template = MOCK_TEMPLATES.find(tp => tp.id === Number(templateMatch[1]));
    return template ? ok(template) : notFound();
  }

  // POST/PUT/DELETE /templates and attachments
  if (/^\/templates(\/\d+)?(\/attachments.*)?$/.test(path)) return noContent();

  return null;
}

export function setupMockInterceptor(): void {
  const originalFetch = globalThis.fetch.bind(globalThis);

  globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : (input as Request).url;

    if (url.startsWith(MOCK_ORIGIN)) {
      const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
      const response = handleMockRequest(url, method);
      if (response) return Promise.resolve(response);
    }

    return originalFetch(input, init);
  };
}
