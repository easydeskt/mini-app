import { useQuery } from '@tanstack/react-query';

import { fetchChannelProviders, type ApiChannelProviderResponse } from '@/api/channels';
import { queryKeys } from '@/api/query-keys';
import type { ChannelProviderInfo } from '@/types/channel';
import { buildOrderedSections } from '@/utils/channelSchema';

function toProviderInfo(p: ApiChannelProviderResponse): ChannelProviderInfo {
  return {
    brand: p.brand,
    configSchema: buildOrderedSections(p.config),
    name: p.name,
  };
}

export function useChannelProviders(): { data: ChannelProviderInfo[]; isLoading: boolean } {
  const { data = [], isLoading } = useQuery({
    queryKey: queryKeys.channels.providers,
    queryFn: fetchChannelProviders,
    retry: false,
  });
  return { data: data.map(toProviderInfo), isLoading };
}

export function useChannelProvider(brand: string): { data: ChannelProviderInfo | undefined; isLoading: boolean } {
  const { data: providers, isLoading } = useChannelProviders();
  return { data: brand ? providers.find(p => p.brand === brand) : undefined, isLoading };
}
