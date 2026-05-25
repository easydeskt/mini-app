import { useQuery } from '@tanstack/react-query';

import { fetchTemplate, fetchTemplates, type ApiTemplateResponse } from '@/api/templates';
import { queryKeys } from '@/api/query-keys';
import type { ReplyTemplate } from '@/types/template';

function toTemplate(t: ApiTemplateResponse): ReplyTemplate {
  return {
    attachments: t.attachments,
    content: t.content,
    id: t.id,
    name: t.human_name,
  };
}

export function useTemplates(): { data: ReplyTemplate[]; isError: boolean; isLoading: boolean; refetch: () => void; error: unknown } {
  const { data = [], isError, isLoading, refetch, error } = useQuery({
    queryKey: queryKeys.templates.all,
    queryFn: fetchTemplates,
    retry: false,
    select: (raw) => raw
      .map(toTemplate)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })),
  });
  return { data, isError, isLoading, refetch: () => { void refetch(); }, error };
}

export function useTemplate(id: number): { data: ReplyTemplate | undefined; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.templates.detail(id),
    queryFn: () => fetchTemplate(id),
    enabled: id > 0,
    retry: false,
    select: toTemplate,
    staleTime: 30_000,
  });
  return { data, isLoading };
}
