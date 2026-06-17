import { apiClient } from './client';

export type ApiVaultSecretResponse = {
  description: string | null;
  id: number;
  name: string;
  updated_at: string;
};

export const fetchSecrets = () =>
  apiClient.get<ApiVaultSecretResponse[]>('/vault');

export const createSecret = (name: string, description: string, value: string) =>
  apiClient.post<ApiVaultSecretResponse>('/vault', {
    name,
    description: description || null,
    value,
  });

// description: always sent (empty string → clears to null per backend contract)
// value: only sent when non-empty (omitted = keep existing value)
export const updateSecret = (id: number, description: string, value?: string) =>
  apiClient.put<ApiVaultSecretResponse>(`/vault/${id}`, {
    description,
    ...(value ? { value } : {}),
  });

export const deleteSecret = (id: number) =>
  apiClient.delete(`/vault/${id}`);
