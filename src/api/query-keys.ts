export const queryKeys = {
  agents: {
    all: ['agents'] as const,
    detail: (id: string) => ['agents', id] as const,
  },
  channels: {
    list: (enabledOnly: boolean) => ['channels', { enabledOnly }] as const,
    providers: ['channels', 'providers'] as const,
  },
  me: ['me'] as const,
  tags: {
    all: ['tags'] as const,
  },
  templates: {
    all: ['templates'] as const,
    detail: (id: number) => ['templates', id] as const,
  },
  tickets: {
    all: ['tickets'] as const,
    detail: (id: number) => ['tickets', id] as const,
  },
  workspace: ['workspace'] as const,
};
