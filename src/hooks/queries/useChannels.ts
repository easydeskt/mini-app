import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { fetchChannels, type ApiChannelResponse } from '@/api/channels';
import { queryKeys } from '@/api/query-keys';
import type { Channel } from '@/types/channel';

function toChannel(c: ApiChannelResponse): Channel {
  return {
    brand: c.brand,
    config: c.config ?? {},
    createdAt: c.created_at,
    displayName: c.display_name,
    id: c.id,
    isEnabled: c.is_enabled,
  };
}

function toChannelList(data: ApiChannelResponse[]): Channel[] {
  return data.map(toChannel);
}

export function useChannels(): { data: Channel[]; isError: boolean; isLoading: boolean; refetch: () => void; error: unknown } {
  const { data = [], isError, isLoading, refetch, error } = useQuery({
    queryKey: queryKeys.channels.list(false),
    queryFn: () => fetchChannels(false),
    retry: false,
    select: toChannelList,
  });
  return { data, isError, isLoading, refetch: () => { void refetch(); }, error };
}

export function useChannel(id: number | undefined): { data: Channel | undefined; isLoading: boolean } {
  const { data: channels, isLoading } = useChannels();
  const channel = useMemo(
    () => (id !== undefined ? channels.find(c => c.id === id) : undefined),
    [id, channels],
  );
  return { data: channel, isLoading };
}
