import { useEffect, useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MonitorSmartphone } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { toast } from 'sonner';

import { ApiError } from '@/api/client';
import { createChannel, updateChannel } from '@/api/channels';
import { queryKeys } from '@/api/query-keys';
import { ChannelConfigSection } from '@/components/admin/ChannelConfigSection';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useBackButton } from '@/hooks/useBackButton';
import { useChannel } from '@/hooks/queries/useChannels';
import { useChannelProvider } from '@/hooks/useChannelProviders';
import { useT } from '@/hooks/useT';
import type { ChannelProviderInfo } from '@/types/channel';
import { isRootSection } from '@/utils/channelSchema';

function setFieldValue(
  config: Record<string, unknown>,
  sectionKey: string,
  fieldKey: string,
  value: unknown,
): Record<string, unknown> {
  if (isRootSection(sectionKey)) return { ...config, [fieldKey]: value };
  const existing = (config[sectionKey] as Record<string, unknown> | undefined) ?? {};
  return { ...config, [sectionKey]: { ...existing, [fieldKey]: value } };
}

function buildDefaultConfig(provider: ChannelProviderInfo): Record<string, unknown> {
  const config: Record<string, unknown> = {};
  for (const section of provider.configSchema) {
    if (isRootSection(section.key)) {
      for (const field of section.fields) {
        if (field.defaultValue !== undefined) config[field.key] = field.defaultValue;
      }
    } else {
      const sectionData: Record<string, unknown> = {};
      for (const field of section.fields) {
        if (field.defaultValue !== undefined) sectionData[field.key] = field.defaultValue;
      }
      if (Object.keys(sectionData).length > 0) config[section.key] = sectionData;
    }
  }
  return config;
}

export function ChannelEditPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const t = useT();

  const isNew = id === 'new';
  const brandParam = searchParams.get('brand') ?? '';

  const channelId = isNew ? undefined : Number(id);
  const { data: channel } = useChannel(channelId);
  const resolvedBrand = isNew ? brandParam : (channel?.brand ?? '');
  const { data: provider, isLoading: providerLoading } = useChannelProvider(resolvedBrand);

  const [displayName, setDisplayName] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [config, setConfig] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (channel && !isNew) {
      setDisplayName(channel.displayName);
      setIsEnabled(channel.isEnabled);
      setConfig(channel.config);
    }
  }, [channel, isNew]);

  useEffect(() => {
    if (isNew && provider) {
      setConfig(buildDefaultConfig(provider));
    }
  }, [isNew, provider]);

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: () => isNew
      ? createChannel(resolvedBrand, displayName.trim(), config)
      : updateChannel(channelId!, displayName.trim(), isEnabled, config),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.channels.list(false) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.channels.list(true) });
      void navigate('/admin/channels');
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        toast.error(t('channels.name_conflict') ?? 'A channel with this name already exists');
      } else {
        toast.error(t('channels.save_error') ?? 'Failed to save channel');
      }
    },
  });

  useBackButton();

  if (providerLoading) return null;

  if (!provider) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">{t('channels.edit_provider_not_found')}</p>
      </div>
    );
  }

  const handleFieldChange = (sectionKey: string, fieldKey: string, value: unknown) => {
    setConfig(prev => setFieldValue(prev, sectionKey, fieldKey, value));
  };

  const handleSave = () => {
    saveMutation.mutate();
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-[480px] px-4 pb-3 pt-4">
          <h1 className="text-2xl font-bold tracking-tight">
            {isNew ? (t('channels.edit_title_new') ?? 'New channel') : displayName || provider.name}
          </h1>
          <p className="text-sm text-muted-foreground">{provider.name}</p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[480px] flex flex-1 flex-col gap-3 px-4 py-3">
        {provider.configSchema.map(section => (
          <ChannelConfigSection
            key={section.key}
            brand={resolvedBrand}
            section={section}
            config={config}
            onChange={handleFieldChange}
          />
        ))}
      </div>

      <div className="sticky bottom-0 z-10 border-t bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-[480px] flex flex-col gap-3 px-4 pb-6 pt-3">
        <InputGroup>
          <InputGroupAddon>
            <MonitorSmartphone className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            value={displayName}
            placeholder={t('channels.edit_name_placeholder_fallback') ?? 'Channel name'}
            onChange={e => setDisplayName(e.target.value)}
          />
        </InputGroup>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-sm font-medium leading-none">{t('channels.edit_channel_active_label') ?? 'Channel active'}</p>
            <p className="text-xs text-muted-foreground">{t('channels.edit_channel_active_description') ?? 'Handling requests and replies'}</p>
          </div>
          <Switch checked={isEnabled} onCheckedChange={setIsEnabled} className="mt-0.5 shrink-0" />
        </div>
        <Separator />
        <Button className="w-full" disabled={!displayName.trim() || saveMutation.isPending} onClick={handleSave}>
          {t('channels.edit_save') ?? 'Save'}
        </Button>
        </div>
      </div>
    </div>
  );
}
