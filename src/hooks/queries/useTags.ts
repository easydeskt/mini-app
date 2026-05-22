import { useQuery } from '@tanstack/react-query';

import { fetchTags, type ApiTagResponse } from '@/api/tags';
import { queryKeys } from '@/api/query-keys';
import type { Tag } from '@/types/tag';

export function toTag(t: ApiTagResponse): Tag {
  return {
    color: t.color,
    id: t.id,
    name: t.name,
  };
}

export function useTags(): { data: Tag[]; isError: boolean; isLoading: boolean; refetch: () => void; error: unknown } {
  const { data = [], isError, isLoading, refetch, error } = useQuery({
    queryKey: queryKeys.tags.all,
    queryFn: fetchTags,
    retry: false,
  });
  return { data: data.map(toTag), isError, isLoading, refetch: () => { void refetch(); }, error };
}
