import { useState } from 'react';

import { ArrowLeft, MonitorSmartphone } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import { ChannelConfigSection } from '@/components/admin/ChannelConfigSection';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useBackButton } from '@/hooks/useBackButton';
import { useChannelProvider } from '@/hooks/useChannelProviders';
import { useChannel } from '@/hooks/queries/useChannels';
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

  const [displayName, setDisplayName] = useState(channel?.displayName ?? '');
  const [isEnabled, setIsEnabled] = useState(channel?.isEnabled ?? true);
  const [config, setConfig] = useState<Record<string, unknown>>(
    () => channel?.config ?? (provider ? buildDefaultConfig(provider) : {}),
  );

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
    void navigate('/admin/channels');
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background/80 px-4 py-3 backdrop-blur-md">
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 rounded-full"
          onClick={() => void navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-1 flex-col items-center">
          <h1 className="text-base font-semibold leading-tight">
            {isNew ? (t('channels.edit_title_new') ?? 'New channel') : displayName || provider.name}
          </h1>
          <p className="text-xs text-muted-foreground">{provider.name}</p>
        </div>
        <div className="size-9 shrink-0" />
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 py-3">
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

      <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t bg-background/80 px-4 pb-6 pt-3 backdrop-blur-md">
        <InputGroup>
          <InputGroupAddon>
            <MonitorSmartphone className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            value={displayName}
            placeholder={provider.name || (t('channels.edit_name_placeholder_fallback') ?? 'Channel name')}
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
        <Button className="w-full" onClick={handleSave}>
          {t('channels.edit_save') ?? 'Save'}
        </Button>
      </div>
    </div>
  );
}
