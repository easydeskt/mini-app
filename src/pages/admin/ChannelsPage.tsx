import React, { useState } from 'react';

import { ChevronRight, MonitorSmartphone, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';

import { ChannelTypePickerSheet } from '@/components/admin/ChannelTypePickerSheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FetchError } from '@/components/ui/list-error';
import { Skeleton } from '@/components/ui/skeleton';
import { useBackButton } from '@/hooks/useBackButton';
import { useChannelProvider } from '@/hooks/useChannelProviders';
import { useChannels } from '@/hooks/queries/useChannels';
import { useT } from '@/hooks/useT';
import type { Channel, ChannelProviderInfo } from '@/types/channel';

type ChannelRowProps = {
  channel: Channel;
  provider: ChannelProviderInfo | undefined;
  onClick: () => void;
};

function ChannelRow({ channel, provider, onClick }: ChannelRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 active:bg-muted"
    >
      <MonitorSmartphone className="size-5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{channel.displayName}</p>
        <p className="text-xs text-muted-foreground">{provider?.name ?? channel.brand}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

type ChannelListProps = {
  channels: Channel[];
  onChannelClick: (channel: Channel) => void;
};

function ChannelList({ channels, onChannelClick }: ChannelListProps) {
  return (
    <Card className="py-0">
      <CardContent className="p-0">
        {channels.map((channel, i) => (
          <React.Fragment key={channel.id}>
            {i > 0 && <div className="mx-4 h-px bg-border" />}
            <ChannelRowWithProvider channel={channel} onClick={() => onChannelClick(channel)} />
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  );
}

type ChannelRowWithProviderProps = {
  channel: Channel;
  onClick: () => void;
};

function ChannelRowWithProvider({ channel, onClick }: ChannelRowWithProviderProps) {
  const { data: provider } = useChannelProvider(channel.brand);
  return <ChannelRow channel={channel} provider={provider} onClick={onClick} />;
}

export function ChannelsPage() {
  const [pickerOpen, setPickerOpen] = useState(false);
  const navigate = useNavigate();
  const { data: channels, isError, isLoading, refetch, error } = useChannels();
  const t = useT();

  useBackButton();

  const activeChannels = channels.filter(c => c.isEnabled);
  const disabledChannels = channels.filter(c => !c.isEnabled);

  const handleChannelClick = (channel: Channel) => {
    void navigate(`/admin/channels/${channel.id}`);
  };

  const handleProviderSelect = (brand: string) => {
    void navigate(`/admin/channels/new?brand=${brand}`);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-[480px] px-4 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('channels.page_title') ?? 'Channels'}</h1>
            {isLoading ? (
              <Skeleton className="mt-1 h-4 w-20" />
            ) : (
              <p className="text-sm text-muted-foreground">{activeChannels.length} {t('channels.subtitle_active') ?? 'active'}</p>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => setPickerOpen(true)}
            aria-label={t('channels.add') ?? 'Add channel'}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-4 pb-8">
        {isLoading ? (
          <div className="space-y-0 overflow-hidden rounded-xl border bg-card">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="h-5 w-5 rounded" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <FetchError description={t('channels.load_error') ?? 'Failed to load the channel list'} onRetry={refetch} error={error} />
        ) : channels.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t('channels.empty') ?? 'No channels'}</p>
        ) : (
          <div className="flex flex-col gap-6">
            {activeChannels.length > 0 && (
              <div>
                <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t('channels.section_active') ?? 'Active'}
                </p>
                <ChannelList channels={activeChannels} onChannelClick={handleChannelClick} />
              </div>
            )}
            {disabledChannels.length > 0 && (
              <div className="opacity-60" data-testid="disabled-channels">
                <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t('channels.section_disabled') ?? 'Disabled'}
                </p>
                <ChannelList channels={disabledChannels} onChannelClick={handleChannelClick} />
              </div>
            )}
          </div>
        )}
      </div>

      <ChannelTypePickerSheet
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleProviderSelect}
      />
    </div>
  );
}
