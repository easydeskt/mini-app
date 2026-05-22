import { apiClient } from './client';
import type { ApiConfigSchema } from '@/types/channel';

export type ApiChannelResponse = {
  brand: string;
  created_at: string;
  display_name: string;
  id: number;
  is_enabled: boolean;
};

export type ApiChannelProviderResponse = {
  brand: string;
  config: ApiConfigSchema;
  name: string;
};

export const fetchChannelProviders = () =>
  apiClient.get<ApiChannelProviderResponse[]>('/api/channels/providers');

export const fetchChannels = (enabledOnly = false) =>
  apiClient.get<ApiChannelResponse[]>(`/api/channels?enabledOnly=${enabledOnly}`);
