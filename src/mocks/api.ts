import { MOCK_CHANNELS, MOCK_CHANNEL_PROVIDERS } from './channels';

const CURRENT_AGENT_ID = 'agent-vl-001';

let MOCK_AGENTS: Record<string, Record<string, unknown>> = {
  [CURRENT_AGENT_ID]: {
    id: CURRENT_AGENT_ID,
    display_name: 'Vladislav L',
    role: 'ADMIN',
    is_active: true,
    created_at: '2025-11-01T10:00:00Z',
    updated_at: '2025-11-01T10:00:00Z',
    telegram_username: 'soknight',
    added_by_agent_id: null,
  },
  'agent-anna-002': {
    id: 'agent-anna-002',
    display_name: 'Anna K',
    role: 'OPERATOR',
    is_active: true,
    created_at: '2025-12-15T09:00:00Z',
    updated_at: '2025-12-15T09:00:00Z',
    telegram_username: 'anna_k',
    added_by_agent_id: CURRENT_AGENT_ID,
  },
  'agent-misha-003': {
    id: 'agent-misha-003',
    display_name: 'Mikhail R',
    role: 'OPERATOR',
    is_active: true,
    created_at: '2026-01-20T11:00:00Z',
    updated_at: '2026-01-20T11:00:00Z',
    telegram_username: null,
    added_by_agent_id: CURRENT_AGENT_ID,
  },
};

let MOCK_TAGS: Array<Record<string, unknown>> = [
  { id: 1,  name: 'Баг',           color: -16776961   },
  { id: 2,  name: 'Вопрос',        color: null        },
  { id: 3,  name: 'Срочно',        color: -8388353    },
  { id: 4,  name: 'Новый клиент',  color: 65535       },
  { id: 5,  name: 'Решено',        color: 583360255   },
  { id: 6,  name: 'Ожидание',      color: -357365505  },
  { id: 7,  name: 'Оплата',        color: 347645695   },
  { id: 8,  name: 'Технический',   color: -1470760961 },
  { id: 9,  name: 'VIP',           color: -174191617  },
  { id: 10, name: 'Возврат',       color: -197173505  },
  { id: 11, name: 'Жалоба',        color: -330786305  },
  { id: 12, name: 'Интеграция',    color: 1667691007  },
  { id: 13, name: 'Продление',     color: 112645375   },
  { id: 14, name: 'Отложено',      color: 1685359615  },
];

let MOCK_TEMPLATES: Array<Record<string, unknown>> = [
  { id: 1, human_name: 'Приветствие', content: 'Добрый день! Чем могу помочь?', has_attachments: false },
  { id: 2, human_name: 'Ожидание ответа', content: 'Спасибо за обращение. Мы изучим ваш вопрос и ответим в ближайшее время.', has_attachments: false },
  { id: 3, human_name: 'Завершение', content: 'Спасибо за обращение! Если у вас возникнут дополнительные вопросы — обращайтесь.', has_attachments: false },
];

let MOCK_CHANNELS_STATE = MOCK_CHANNELS.map(c => ({
  id: c.id,
  brand: c.brand,
  display_name: c.displayName,
  is_enabled: c.isEnabled,
  config: c.config as Record<string, unknown>,
  created_at: c.createdAt,
}));

// last_message_at timestamps are relative to 2026-05-21T12:35Z to showcase formatRelativeTime ranges
const MOCK_TICKETS = [
  {
    id: 1,
    status: 'OPEN',
    priority: 'HIGH',
    created_at: '2026-05-21T12:00:00Z',
    last_message_at: '2026-05-21T12:34:00Z',
    attachment_count: 2,
    unread_count: 3,
    assigned_agent_id: null,
    conversation_id: 101,
    merged_into_ticket_id: null,
    topic_url: null,
    tags: [MOCK_TAGS[2], MOCK_TAGS[0], MOCK_TAGS[8]],
    source_type: 'tg',
    channel_name: '@easydeskbot',
    client_name: 'Алексей Волков',
    client_url: 'https://t.me/alex_volkov',
    message_preview: 'Привет, уже два дня пытаюсь вывести, но кнопка серая. На балансе 248 USDT, но когда нажимаю — ничего не происходит.',
    notes: [
      {
        id: 10,
        type: 'client',
        text: 'Клиент уже обращался месяц назад с похожей проблемой — тогда помогла верификация 2FA.',
        author_name: 'Anna K',
        created_at: '2026-05-21T12:10:00Z',
      },
    ],
  },
  {
    id: 2,
    status: 'OPEN',
    priority: 'MEDIUM',
    created_at: '2026-05-21T11:00:00Z',
    last_message_at: '2026-05-21T12:05:00Z',
    unread_count: 1,
    assigned_agent_id: null,
    conversation_id: 102,
    merged_into_ticket_id: null,
    topic_url: null,
    tags: [
      MOCK_TAGS[0], MOCK_TAGS[1], MOCK_TAGS[2], MOCK_TAGS[4],
      MOCK_TAGS[5], MOCK_TAGS[8], MOCK_TAGS[9], MOCK_TAGS[12],
    ],
    source_type: 'mail',
    channel_name: 'support@easydeskapp.com',
    client_name: 'kate.d@gmail.com',
    client_url: 'mailto:kate.d@gmail.com',
    message_preview: 'Было бы здорово экспортировать инвойсы в тёмной теме, чтобы они совпадали с остальным интерфейсом.',
  },
  {
    id: 3,
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    created_at: '2026-05-21T08:00:00Z',
    last_message_at: '2026-05-21T10:35:00Z',
    unread_count: 2,
    assigned_at: '2026-05-21T08:30:00Z',
    resolved_at: null,
    closed_at: null,
    merged_at: null,
    assigned_agent_id: CURRENT_AGENT_ID,
    conversation_id: 103,
    merged_into_ticket_id: null,
    topic_url: 'https://t.me/c/1234567890/42',
    tags: [MOCK_TAGS[1], MOCK_TAGS[6], MOCK_TAGS[7]],
    source_type: 'tg',
    channel_name: '@easydeskbot',
    client_name: 'Дмитрий Соколов',
    message_preview: 'Сменил номер две недели назад. SMS из других приложений приходят, а коды от вашего сервиса — нет.',
    notes: [
      {
        id: 11,
        type: 'ticket',
        text: 'Проверено: номер привязан корректно, СМС уходят с нашей стороны. Вероятно, блокировка на уровне оператора.',
        author_name: 'Vladislav L',
        created_at: '2026-05-21T09:15:00Z',
      },
      {
        id: 12,
        type: 'client',
        text: 'Клиент живёт в регионе с известными проблемами у МТС. Аналогичные жалобы уже были от этого региона.',
        author_name: 'Anna K',
        created_at: '2026-05-21T08:45:00Z',
      },
    ],
  },
  {
    id: 4,
    status: 'IN_PROGRESS',
    priority: 'LOW',
    created_at: '2026-05-21T05:00:00Z',
    last_message_at: '2026-05-21T07:35:00Z',
    assigned_at: '2026-05-21T05:20:00Z',
    resolved_at: null,
    closed_at: null,
    merged_at: null,
    assigned_agent_id: 'agent-anna-002',
    conversation_id: 104,
    merged_into_ticket_id: null,
    topic_url: null,
    tags: [MOCK_TAGS[1], MOCK_TAGS[0], MOCK_TAGS[2], MOCK_TAGS[11]],
    source_type: 'tg',
    channel_name: '@easydeskbot',
    client_name: 'Никита Петров',
    message_preview: 'Пробовал в вебе и в мини-аппе, код TG10 действителен до 30 сентября, но сумма в корзине другая.',
    notes: [
      {
        id: 13,
        type: 'ticket',
        text: 'Промокод применён, но скидка не суммируется с текущей акцией. Баг подтверждён на стейджинге.',
        author_name: 'Anna K',
        created_at: '2026-05-21T06:00:00Z',
      },
    ],
  },
  {
    id: 5,
    status: 'RESOLVED',
    priority: 'MEDIUM',
    created_at: '2026-05-20T14:00:00Z',
    last_message_at: '2026-05-20T20:00:00Z',
    attachment_count: 5,
    assigned_at: '2026-05-20T14:30:00Z',
    resolved_at: '2026-05-20T21:15:00Z',
    resolution_note: 'В настройках бота язык был выставлен на English принудительно. Переключили на Auto, чтобы следовать языку пользователя. Клиент подтвердил, что теперь всё приходит на русском.',
    notes: [
      {
        id: 1,
        type: 'ticket',
        text: 'Провайдер SMS жалуется на оператора — массовые задержки в РФ за последние сутки.',
        author_name: 'Anna K',
        created_at: '2026-05-20T20:42:00Z',
      },
      {
        id: 2,
        type: 'client',
        text: 'Регулярно теряет доступ — это третий 2FA-инцидент за полгода.',
        author_name: 'Mikhail R',
        created_at: '2026-05-16T11:00:00Z',
      },
    ],
    closed_at: null,
    merged_at: null,
    assigned_agent_id: CURRENT_AGENT_ID,
    conversation_id: 105,
    merged_into_ticket_id: null,
    topic_url: null,
    tags: [],
    source_type: 'tg',
    channel_name: '@easydeskbot',
    client_name: '@oleg_pro',
    client_url: 'https://t.me/oleg_pro',
    message_preview: 'В Telegram у меня выбран русский, но бот отвечает на английском. Это баг или настройка на вашей стороне?',
  },
  {
    id: 6,
    status: 'CLOSED',
    priority: 'LOW',
    created_at: '2026-05-18T09:00:00Z',
    last_message_at: '2026-05-18T14:40:00Z',
    assigned_at: '2026-05-18T09:15:00Z',
    resolved_at: null,
    closed_at: '2026-05-18T14:40:00Z',
    merged_at: null,
    assigned_agent_id: 'agent-misha-003',
    conversation_id: 106,
    merged_into_ticket_id: null,
    topic_url: null,
    tags: [MOCK_TAGS[3], MOCK_TAGS[4], MOCK_TAGS[9]],
    source_type: 'mail',
    channel_name: 'support@easydeskapp.com',
    client_name: 'support@company.ru',
    message_preview: 'Добрый день, хотим подключить корпоративный аккаунт на 50 пользователей. Расскажите об условиях.',
    notes: [
      {
        id: 14,
        type: 'client',
        text: 'Крупный B2B-клиент, интересуется корпоративным планом. Передать в отдел продаж при повторном обращении.',
        author_name: 'Mikhail R',
        created_at: '2026-05-18T10:30:00Z',
      },
      {
        id: 15,
        type: 'ticket',
        text: 'Выслали КП на 50 лицензий. Ждём ответа до конца мая.',
        author_name: 'Mikhail R',
        created_at: '2026-05-18T14:00:00Z',
      },
    ],
  },
  {
    id: 7,
    status: 'MERGED',
    priority: 'MEDIUM',
    created_at: '2026-05-16T12:00:00Z',
    last_message_at: '2026-05-16T16:05:00Z',
    assigned_at: null,
    resolved_at: null,
    closed_at: '2026-05-16T16:10:00Z',
    merged_at: '2026-05-16T16:05:00Z',
    assigned_agent_id: null,
    conversation_id: 107,
    merged_into_ticket_id: 3,
    topic_url: null,
    tags: [],
    source_type: 'tg',
    channel_name: '@easydeskbot',
    client_name: 'Дмитрий Соколов',
    message_preview: 'Продублирую вопрос — смс-коды всё ещё не приходят. Уже третий день.',
  },
  {
    id: 8,
    status: 'OPEN',
    priority: 'HIGH',
    created_at: '2026-05-14T07:00:00Z',
    last_message_at: '2026-05-14T07:30:00Z',
    unread_count: 1,
    assigned_agent_id: null,
    conversation_id: 108,
    merged_into_ticket_id: null,
    topic_url: null,
    tags: [MOCK_TAGS[2], MOCK_TAGS[12]],
    source_type: 'vk',
    channel_name: 'EasyDesk ВКонтакте',
    client_name: 'Марина Ф.',
    message_preview: 'Оплатила подписку через ВКонтакте, деньги списаны, но доступ не открылся. Чек прилагаю.',
  },
  {
    id: 9,
    status: 'OPEN',
    priority: null,
    created_at: '2026-05-21T12:30:00Z',
    last_message_at: '2026-05-21T12:33:00Z',
    unread_count: 5,
    assigned_agent_id: null,
    conversation_id: 109,
    merged_into_ticket_id: null,
    topic_url: null,
    tags: [],
    source_type: 'tg',
    channel_name: '@easydeskbot',
    client_name: 'Иван Н.',
    message_preview: 'Не могу войти в аккаунт, двухфакторная авторизация не работает.',
    notes: [
      {
        id: 16,
        type: 'client',
        text: 'Повторное обращение. Предыдущий инцидент с 2FA был в марте, решили сбросом приложения.',
        author_name: 'Vladislav L',
        created_at: '2026-05-21T12:32:00Z',
      },
    ],
  },
  {
    id: 10,
    status: 'OPEN',
    priority: 'MEDIUM',
    created_at: '2026-05-21T11:45:00Z',
    last_message_at: '2026-05-21T12:20:00Z',
    assigned_agent_id: null,
    conversation_id: 110,
    merged_into_ticket_id: null,
    topic_url: null,
    tags: [],
    source_type: 'tg',
    channel_name: '@easydeskbot',
    client_name: 'Елена Сергеева',
    message_preview: 'Добрый день! Хочу сообщить о серьёзной проблеме с моим аккаунтом. Уже несколько дней пытаюсь войти, но каждый раз получаю ошибку «Неверный пароль», хотя я точно использую правильные данные.',
  },
  {
    id: 11,
    status: 'RESOLVED',
    priority: 'MEDIUM',
    created_at: '2026-05-19T10:00:00Z',
    last_message_at: '2026-05-19T15:00:00Z',
    assigned_at: '2026-05-19T10:30:00Z',
    resolved_at: '2026-05-19T15:30:00Z',
    resolution_note: 'Уточнили список операторов с задержками, передали клиенту.',
    closed_at: null,
    merged_at: null,
    assigned_agent_id: CURRENT_AGENT_ID,
    conversation_id: 111,
    merged_into_ticket_id: null,
    topic_url: null,
    tags: [],
    source_type: 'tg',
    channel_name: '@easydeskbot',
    client_name: 'Дмитрий Соколов',
    message_preview: 'Раньше писал про SMS-коды — хочу уточнить, по каким операторам сейчас есть задержки.',
  },
  {
    id: 12,
    status: 'CLOSED',
    priority: 'LOW',
    created_at: '2026-05-15T08:00:00Z',
    last_message_at: '2026-05-15T12:00:00Z',
    assigned_at: '2026-05-15T08:20:00Z',
    resolved_at: null,
    closed_at: '2026-05-15T12:00:00Z',
    merged_at: null,
    assigned_agent_id: 'agent-anna-002',
    conversation_id: 112,
    merged_into_ticket_id: null,
    topic_url: null,
    tags: [],
    source_type: 'tg',
    channel_name: '@easydeskbot',
    client_name: 'Дмитрий Соколов',
    message_preview: 'Спасибо за помощь с прошлым вопросом — всё заработало, доступ восстановился.',
  },
];

let nextTagId = 15;
let nextTemplateId = 4;
let nextChannelId = 4;

function jsonResponse(data: unknown, status = 200): Promise<Response> {
  return Promise.resolve(
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

function noContent(): Promise<Response> {
  return Promise.resolve(new Response(null, { status: 204 }));
}

function notFound(message = 'Not found'): Promise<Response> {
  return jsonResponse({ error_message: message }, 404);
}

async function parseBody(init: RequestInit | undefined): Promise<Record<string, unknown>> {
  if (!init?.body) return {};
  try {
    return JSON.parse(String(init.body)) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function installMockApi(): void {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async function mockFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const url = String(input);
    const method = (init?.method ?? 'GET').toUpperCase();

    // /api/v1/me
    if (url.includes('/api/v1/me')) {
      return jsonResponse({
        agent: MOCK_AGENTS[CURRENT_AGENT_ID],
        in_progress_ticket_count: MOCK_TICKETS.filter(
          t => t.status === 'IN_PROGRESS' && t.assigned_agent_id === CURRENT_AGENT_ID,
        ).length,
        open_ticket_count: MOCK_TICKETS.filter(t => t.status === 'OPEN').length,
      });
    }

    // /api/v1/tickets/{id}/action
    const ticketActionMatch = url.match(/\/api\/v1\/tickets\/(\d+)\/(assign|free|resolve|close|reopen|priority|tags|merge)/);
    if (ticketActionMatch) return noContent();

    // /api/v1/tickets/{id}
    const ticketDetailMatch = url.match(/\/api\/v1\/tickets\/(\d+)$/);
    if (ticketDetailMatch) {
      const ticket = MOCK_TICKETS.find(t => t.id === Number(ticketDetailMatch[1]));
      return ticket ? jsonResponse(ticket) : notFound('Ticket not found');
    }

    // /api/v1/tickets
    if (url.includes('/api/v1/tickets')) return jsonResponse(MOCK_TICKETS);

    // /api/v1/agents/{id}
    const agentDetailMatch = url.match(/\/api\/v1\/agents\/([^/?]+)/);
    if (agentDetailMatch) {
      const agentId = agentDetailMatch[1];
      if (method === 'PATCH') {
        const body = await parseBody(init);
        const existing = MOCK_AGENTS[agentId];
        if (!existing) return notFound('Agent not found');
        MOCK_AGENTS[agentId] = { ...existing, ...body, updated_at: new Date().toISOString() };
        return jsonResponse(MOCK_AGENTS[agentId]);
      }
      const agent = MOCK_AGENTS[agentId];
      return agent ? jsonResponse(agent) : notFound('Agent not found');
    }

    // /api/v1/agents
    if (url.includes('/api/v1/agents')) {
      const activeOnly = url.includes('activeOnly=false') ? false : true;
      const agents = Object.values(MOCK_AGENTS).filter(a => !activeOnly || a['is_active'] === true);
      return jsonResponse(agents);
    }

    // /api/v1/tags/{id}
    const tagDetailMatch = url.match(/\/api\/v1\/tags\/(\d+)$/);
    if (tagDetailMatch) {
      const tagId = Number(tagDetailMatch[1]);
      if (method === 'PUT') {
        const body = await parseBody(init);
        const idx = MOCK_TAGS.findIndex(t => t['id'] === tagId);
        if (idx < 0) return notFound('Tag not found');
        MOCK_TAGS[idx] = { ...MOCK_TAGS[idx], name: body['name'], color: body['color'] ?? null };
        return jsonResponse(MOCK_TAGS[idx]);
      }
      if (method === 'DELETE') {
        const idx = MOCK_TAGS.findIndex(t => t['id'] === tagId);
        if (idx >= 0) MOCK_TAGS.splice(idx, 1);
        return noContent();
      }
      const tag = MOCK_TAGS.find(t => t['id'] === tagId);
      return tag ? jsonResponse(tag) : notFound('Tag not found');
    }

    // /api/v1/tags
    if (url.includes('/api/v1/tags')) {
      if (method === 'POST') {
        const body = await parseBody(init);
        const newTag = { id: nextTagId++, name: body['name'], color: body['color'] ?? null, created_at: new Date().toISOString() };
        MOCK_TAGS.push(newTag);
        return jsonResponse(newTag, 201);
      }
      return jsonResponse(MOCK_TAGS);
    }

    // /api/v1/channels/providers
    if (url.includes('/api/v1/channels/providers')) {
      return jsonResponse(MOCK_CHANNEL_PROVIDERS);
    }

    // /api/v1/channels/{id}
    const channelDetailMatch = url.match(/\/api\/v1\/channels\/(\d+)$/);
    if (channelDetailMatch) {
      const channelId = Number(channelDetailMatch[1]);
      if (method === 'PUT') {
        const body = await parseBody(init);
        const idx = MOCK_CHANNELS_STATE.findIndex(c => c.id === channelId);
        if (idx < 0) return notFound('Channel not found');
        MOCK_CHANNELS_STATE[idx] = {
          ...MOCK_CHANNELS_STATE[idx],
          ...(body['display_name'] !== undefined ? { display_name: body['display_name'] as string } : {}),
          ...(body['is_enabled'] !== undefined ? { is_enabled: body['is_enabled'] as boolean } : {}),
          ...(body['config'] !== undefined ? { config: body['config'] as Record<string, unknown> } : {}),
        };
        return jsonResponse(MOCK_CHANNELS_STATE[idx]);
      }
      const channel = MOCK_CHANNELS_STATE.find(c => c.id === channelId);
      return channel ? jsonResponse(channel) : notFound('Channel not found');
    }

    // /api/v1/channels
    if (url.includes('/api/v1/channels')) {
      if (method === 'POST') {
        const body = await parseBody(init);
        const newChannel = {
          id: nextChannelId++,
          brand: body['brand'] as string,
          display_name: body['display_name'] as string,
          is_enabled: true,
          config: (body['config'] as Record<string, unknown>) ?? {},
          created_at: new Date().toISOString(),
        };
        MOCK_CHANNELS_STATE.push(newChannel);
        return jsonResponse(newChannel, 201);
      }
      return jsonResponse(MOCK_CHANNELS_STATE);
    }

    // /api/v1/templates/{id}
    const templateDetailMatch = url.match(/\/api\/v1\/templates\/(\d+)$/);
    if (templateDetailMatch) {
      const templateId = Number(templateDetailMatch[1]);
      if (method === 'PUT') {
        const body = await parseBody(init);
        const idx = MOCK_TEMPLATES.findIndex(t => t['id'] === templateId);
        if (idx < 0) return notFound('Template not found');
        MOCK_TEMPLATES[idx] = {
          ...MOCK_TEMPLATES[idx],
          human_name: body['human_name'] as string,
          content: body['content'] as string | null,
        };
        return jsonResponse(MOCK_TEMPLATES[idx]);
      }
      if (method === 'DELETE') {
        const idx = MOCK_TEMPLATES.findIndex(t => t['id'] === templateId);
        if (idx >= 0) MOCK_TEMPLATES.splice(idx, 1);
        return noContent();
      }
      const template = MOCK_TEMPLATES.find(t => t['id'] === templateId);
      return template ? jsonResponse(template) : notFound('Template not found');
    }

    // /api/v1/templates
    if (url.includes('/api/v1/templates')) {
      if (method === 'POST') {
        const body = await parseBody(init);
        const newTemplate = {
          id: nextTemplateId++,
          human_name: body['human_name'] as string,
          content: (body['content'] as string | null) ?? null,
          has_attachments: false,
        };
        MOCK_TEMPLATES.push(newTemplate);
        return jsonResponse(newTemplate, 201);
      }
      return jsonResponse(MOCK_TEMPLATES);
    }

    return originalFetch(input, init);
  };
}
