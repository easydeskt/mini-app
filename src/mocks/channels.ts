import type { ApiChannelProvider, Channel } from '@/types/channel';

export const MOCK_CHANNEL_PROVIDERS: ApiChannelProvider[] = [
  {
    brand: 'tg',
    name: 'Бот в Telegram',
    config: {
      sections: [
        {
          key: '',
          fields: [
            { key: 'token', type: 'text.password', required: true },
            { key: 'api_url', type: 'text.url', required: false, placeholder: 'https://api.telegram.org' },
          ],
          order: ['token', 'api_url'],
        },
        {
          key: 'polling',
          fields: [
            { key: 'enabled', type: 'boolean', required: false, default_value: 'true' },
            { key: 'timeout_seconds', type: 'number.int', required: false, placeholder: '30' },
            { key: 'media_groups_debounce_millis', type: 'number.int', required: false, placeholder: '1000' },
          ],
          order: ['enabled', 'timeout_seconds', 'media_groups_debounce_millis'],
        },
        {
          key: 'webhook',
          fields: [
            { key: 'enabled', type: 'boolean', required: false, default_value: 'false' },
            { key: 'url', type: 'text.url', required: true, placeholder: 'https://example.com' },
            { key: 'listen_path', type: 'text.default', required: false, placeholder: '/telegram/webhook' },
            { key: 'secret_token', type: 'text.password', required: false },
            { key: 'drop_pending_updates', type: 'boolean', required: false, default_value: 'false' },
            { key: 'max_connections', type: 'number.int', required: false, default_value: '40' },
          ],
          order: ['enabled', 'url', 'listen_path', 'secret_token', 'drop_pending_updates', 'max_connections'],
        },
      ],
      order: ['token', 'api_url', 'polling', 'webhook'],
    },
  },
  {
    brand: 'vk',
    name: 'Сообщество ВКонтакте',
    config: {
      sections: [
        {
          key: '',
          fields: [
            { key: 'token', type: 'text.password', required: true },
            { key: 'group_id', type: 'number.long', required: true },
          ],
          order: ['token', 'group_id'],
        },
        {
          key: 'longpoll',
          fields: [
            { key: 'enabled', type: 'boolean', required: false, default_value: 'true' },
            { key: 'wait_seconds', type: 'number.int', required: false, default_value: '30' },
          ],
          order: ['enabled', 'wait_seconds'],
        },
        {
          key: 'callback',
          fields: [
            { key: 'enabled', type: 'boolean', required: false, default_value: 'false' },
            { key: 'confirmation_code', type: 'text.default', required: true },
            { key: 'listen_path', type: 'text.default', required: false, placeholder: '/vkontakte/callback' },
            { key: 'secret', type: 'text.password', required: false },
          ],
          order: ['enabled', 'confirmation_code', 'listen_path', 'secret'],
        },
      ],
      order: ['token', 'group_id', 'longpoll', 'callback'],
    },
  },
  {
    brand: 'mail',
    name: 'Электронная почта',
    config: {
      sections: [
        {
          key: 'from',
          fields: [
            { key: 'address', type: 'text.default', required: true, placeholder: 'support@example.com' },
            { key: 'name', type: 'text.default', required: false, placeholder: 'EasyDesk Support' },
          ],
          order: ['address', 'name'],
        },
        {
          key: '',
          fields: [
            { key: 'reply_to', type: 'text.default', required: false, placeholder: 'no-reply@example.com' },
          ],
          order: ['reply_to'],
        },
        {
          key: 'imap',
          fields: [
            { key: 'host', type: 'text.default', required: true, placeholder: 'imap.gmail.com' },
            { key: 'port', type: 'number.int', required: true, default_value: '993' },
            { key: 'username', type: 'text.default', required: false },
            { key: 'password', type: 'text.password', required: false },
            { key: 'use_ssl', type: 'boolean', required: false, default_value: 'true' },
            { key: 'poll_interval_seconds', type: 'number.int', required: false, default_value: '30' },
          ],
          order: ['host', 'port', 'username', 'password', 'use_ssl', 'poll_interval_seconds'],
        },
        {
          key: 'smtp',
          fields: [
            { key: 'host', type: 'text.default', required: true, placeholder: 'smtp.gmail.com' },
            { key: 'port', type: 'number.int', required: true, default_value: '587' },
            { key: 'username', type: 'text.default', required: false },
            { key: 'password', type: 'text.password', required: false },
            { key: 'start_tls', type: 'boolean', required: false, default_value: 'true' },
          ],
          order: ['host', 'port', 'username', 'password', 'start_tls'],
        },
      ],
      order: ['from', 'reply_to', 'imap', 'smtp'],
    },
  },
];

export const MOCK_CHANNELS: Channel[] = [
  {
    id: 1,
    brand: 'tg',
    displayName: 'Telegram Support',
    isEnabled: true,
    config: {
      token: '7123456789:AAHxyz_mock_token_here',
      api_url: 'https://api.telegram.org',
      polling: { enabled: true, timeout_seconds: 30, media_groups_debounce_millis: 1000 },
      webhook: { enabled: false, url: null, listen_path: '/telegram/webhook', secret_token: null, drop_pending_updates: false, max_connections: 40 },
    },
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    brand: 'vk',
    displayName: 'ВК Сообщество',
    isEnabled: true,
    config: {
      token: 'vk1.a.mock_community_token',
      group_id: 123456789,
      longpoll: { enabled: true, wait_seconds: 30 },
      callback: { enabled: false, listen_path: '/vkontakte/callback', confirmation_code: null, secret: null },
    },
    createdAt: '2024-02-01T08:00:00Z',
  },
  {
    id: 3,
    brand: 'mail',
    displayName: 'support@example.com',
    isEnabled: false,
    config: {
      from: { address: 'support@example.com', name: 'EasyDesk Support' },
      reply_to: null,
      imap: { host: 'imap.gmail.com', port: 993, username: 'support@example.com', password: '••••••••', use_ssl: true, poll_interval_seconds: 30 },
      smtp: { host: 'smtp.gmail.com', port: 587, username: 'support@example.com', password: '••••••••', start_tls: true },
    },
    createdAt: '2024-03-10T12:00:00Z',
  },
];
