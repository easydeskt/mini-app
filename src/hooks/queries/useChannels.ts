import { useQuery } from '@tanstack/react-query';

import { fetchChannels, type ApiChannelResponse } from '@/api/channels';
import { queryKeys } from '@/api/query-keys';
import type { Channel } from '@/types/channel';

function toChannel(c: ApiChannelResponse): Channel {
  return {
    brand: c.brand,
    config: {},
    createdAt: c.created_at,
    displayName: c.display_name,
    id: c.id,
    isEnabled: c.is_enabled,
  };
}

export function useChannels(): { data: Channel[]; isError: boolean; isLoading: boolean; refetch: () => void } {
  const { data = [], isError, isLoading, refetch } = useQuery({
    queryKey: queryKeys.channels.list(false),
    queryFn: () => fetchChannels(false),
    retry: false,
  });
  return { data: data.map(toChannel), isError, isLoading, refetch: () => { void refetch(); } };
}

export function useChannel(id: number | undefined): { data: Channel | undefined; isLoading: boolean } {
  const { data: channels, isLoading } = useChannels();
  return { data: id !== undefined ? channels.find(c => c.id === id) : undefined, isLoading };
}
