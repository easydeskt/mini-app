const CURRENT_AGENT_ID = 'agent-vl-001';

const MOCK_AGENTS: Record<string, object> = {
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

const MOCK_TAGS = [
  { id: 1,  name: 'Баг',           color: -16776961   }, // rgb(255,   0,   0) — red
  { id: 2,  name: 'Вопрос',        color: null        },
  { id: 3,  name: 'Срочно',        color: -8388353    }, // rgb(255, 128,   0) — orange
  { id: 4,  name: 'Новый клиент',  color: 65535       }, // rgb(  0,   0, 255) — blue
  { id: 5,  name: 'Решено',        color: 583360255   }, // rgb( 34, 197,  94) — green
  { id: 6,  name: 'Ожидание',      color: -357365505  }, // rgb(234, 179,   8) — yellow
  { id: 7,  name: 'Оплата',        color: 347645695   }, // rgb( 20, 184, 166) — teal
  { id: 8,  name: 'Технический',   color: -1470760961 }, // rgb(168,  85, 247) — purple
  { id: 9,  name: 'VIP',           color: -174191617  }, // rgb(245, 158,  11) — amber
  { id: 10, name: 'Возврат',       color: -197173505  }, // rgb(244,  63,  94) — rose
  { id: 11, name: 'Жалоба',        color: -330786305  }, // rgb(236,  72, 153) — pink
  { id: 12, name: 'Интеграция',    color: 1667691007  }, // rgb( 99, 102, 241) — indigo
  { id: 13, name: 'Продление',     color: 112645375   }, // rgb(  6, 182, 212) — cyan
  { id: 14, name: 'Отложено',      color: 1685359615  }, // rgb(100, 116, 139) — slate
];

// last_message_at timestamps are relative to 2026-05-21T12:35Z to showcase formatRelativeTime ranges
const MOCK_TICKETS = [
  {
    id: 1,
    status: 'OPEN',
    priority: 'HIGH',
    created_at: '2026-05-21T12:00:00Z',
    last_message_at: '2026-05-21T12:34:00Z', // 1 мин назад
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
    last_message_at: '2026-05-21T12:05:00Z', // 30 мин назад
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
    last_message_at: '2026-05-21T10:35:00Z', // 2 часа назад
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
    last_message_at: '2026-05-21T07:35:00Z', // 5 часов назад
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
    last_message_at: '2026-05-20T20:00:00Z', // вчера
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
    last_message_at: '2026-05-18T14:40:00Z', // 3 дня назад
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
    last_message_at: '2026-05-16T16:05:00Z', // 5 дней назад
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
    last_message_at: '2026-05-14T07:30:00Z', // неделю назад
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
    last_message_at: '2026-05-21T12:33:00Z', // только что
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
    message_preview: 'Добрый день! Хочу сообщить о серьёзной проблеме с моим аккаунтом. Уже несколько дней пытаюсь войти, но каждый раз получаю ошибку «Неверный пароль», хотя я точно использую правильные данные. Я пробовала сбросить пароль через email — письмо не приходит ни в inbox, ни в спам. Пробовала другой браузер и телефон — результат тот же. Мой аккаунт был создан три года назад, в нём хранятся важные рабочие документы и история переписки с вашей командой за весь этот период. Прошу вас как можно скорее помочь восстановить доступ — это критически важно для моей работы.',
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

export function installMockApi(): void {
  const originalFetch = window.fetch.bind(window);

  window.fetch = function mockFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const url = String(input);

    if (url.includes('/api/me')) {
      return jsonResponse({
        agent: MOCK_AGENTS[CURRENT_AGENT_ID],
        in_progress_ticket_count: MOCK_TICKETS.filter(
          t => t.status === 'IN_PROGRESS' && t.assigned_agent_id === CURRENT_AGENT_ID,
        ).length,
        open_ticket_count: MOCK_TICKETS.filter(t => t.status === 'OPEN').length,
      });
    }

    const ticketActionMatch = url.match(/\/api\/tickets\/(\d+)\/(assign|free|resolve|close|reopen|priority|tags|merge)/);
    if (ticketActionMatch) return noContent();

    const ticketDetailMatch = url.match(/\/api\/tickets\/(\d+)$/);
    if (ticketDetailMatch) {
      const ticket = MOCK_TICKETS.find(t => t.id === Number(ticketDetailMatch[1]));
      return ticket
        ? jsonResponse(ticket)
        : jsonResponse({ error_message: 'Ticket not found' }, 404);
    }

    if (url.includes('/api/tickets')) return jsonResponse(MOCK_TICKETS);

    const agentDetailMatch = url.match(/\/api\/agents\/([^/?]+)/);
    if (agentDetailMatch) {
      const agent = MOCK_AGENTS[agentDetailMatch[1]];
      return agent
        ? jsonResponse(agent)
        : jsonResponse({ error_message: 'Agent not found' }, 404);
    }

    if (url.includes('/api/agents')) return jsonResponse(Object.values(MOCK_AGENTS));

    if (url.includes('/api/tags')) return jsonResponse(MOCK_TAGS);

    return originalFetch(input, init);
  };
}
