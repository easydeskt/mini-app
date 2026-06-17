import { useQuery } from '@tanstack/react-query';

import { fetchSecrets, type ApiVaultSecretResponse } from '@/api/vault';
import { queryKeys } from '@/api/query-keys';
import type { VaultSecret } from '@/types/vault';

export function toVaultSecret(s: ApiVaultSecretResponse): VaultSecret {
  return {
    description: s.description,
    id: s.id,
    name: s.name,
    updatedAt: s.updated_at,
  };
}

export function useSecrets(): { data: VaultSecret[]; isError: boolean; isLoading: boolean; refetch: () => void; error: unknown } {
  const { data = [], isError, isLoading, refetch, error } = useQuery({
    queryKey: queryKeys.vault.all,
    queryFn: fetchSecrets,
    retry: false,
  });
  return { data: data.map(toVaultSecret), isError, isLoading, refetch: () => { void refetch(); }, error };
}
