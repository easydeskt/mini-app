import { useMemo } from 'react';

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

function toProviderInfoList(data: ApiChannelProviderResponse[]): ChannelProviderInfo[] {
  return data.map(toProviderInfo);
}

export function useChannelProviders(): { data: ChannelProviderInfo[]; isLoading: boolean } {
  const { data = [], isLoading } = useQuery({
    queryKey: queryKeys.channels.providers,
    queryFn: fetchChannelProviders,
    retry: false,
    select: toProviderInfoList,
  });
  return { data, isLoading };
}

export function useChannelProvider(brand: string): { data: ChannelProviderInfo | undefined; isLoading: boolean } {
  const { data: providers, isLoading } = useChannelProviders();
  const provider = useMemo(
    () => (brand ? providers.find(p => p.brand === brand) : undefined),
    [brand, providers],
  );
  return { data: provider, isLoading };
}
