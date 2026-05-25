import { apiClient } from './client';
import type { ApiConfigSchema } from '@/types/channel';

export type ApiChannelResponse = {
  brand: string;
  config: Record<string, unknown> | null;
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
  apiClient.get<ApiChannelProviderResponse[]>('/channels/providers');

export const fetchChannels = (enabledOnly = false) =>
  apiClient.get<ApiChannelResponse[]>(`/channels?enabledOnly=${enabledOnly}`);

export const createChannel = (brand: string, displayName: string, config: Record<string, unknown>) =>
  apiClient.post<ApiChannelResponse>('/channels', { brand, display_name: displayName, config });

export const updateChannel = (id: number, displayName: string, isEnabled: boolean, config: Record<string, unknown>) =>
  apiClient.put<ApiChannelResponse>(`/channels/${id}`, { display_name: displayName, is_enabled: isEnabled, config });
