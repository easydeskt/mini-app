import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { fetchWorkspace, type WorkspaceResponse } from '@/api/workspace';

export function useWorkspace(): { data: WorkspaceResponse | undefined; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.workspace,
    queryFn: fetchWorkspace,
    staleTime: 60_000,
  });

  return { data, isLoading };
}
