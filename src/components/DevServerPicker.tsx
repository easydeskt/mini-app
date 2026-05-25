import { useEffect, useState } from 'react';

import { initData, miniApp } from '@telegram-apps/sdk-react';

import { setDevServer } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { createT } from '@/i18n';

type ServerOption = 'production' | 'development' | 'custom';

const SERVERS: Record<Exclude<ServerOption, 'custom'>, string> = {
  production: 'https://easydesk.soknight.ru/api/v1',
  development: 'http://localhost:8080/api/v1',
};

type DevServerPickerProps = {
  onConnect: () => void;
};

export function DevServerPicker({ onConnect }: DevServerPickerProps) {
  const [selected, setSelected] = useState<ServerOption>('development');
  const [customUrl, setCustomUrl] = useState('');

  const lang = (() => {
    try { return initData.user()?.language_code === 'ru' ? 'ru' : 'en'; } catch { return 'en'; }
  })();
  const t = createT(lang);

  useEffect(() => {
    try {
      document.documentElement.classList.toggle('dark', miniApp.isDark());
    } catch { /* not in telegram */ }
  }, []);

  function handleConnect() {
    const origin = selected === 'custom'
      ? customUrl.trim().replace(/\/+$/, '')
      : SERVERS[selected];
    if (!origin) return;
    setDevServer(origin);
    onConnect();
  }

  const isValid = selected !== 'custom' || customUrl.trim().length > 0;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-8">

        <div className="flex flex-col items-center gap-4">
          <img src="/logo.svg" alt="EasyDesk" className="h-20 w-20" />
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">EasyDesk</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('server_picker.subtitle')}</p>
          </div>
        </div>

        <RadioGroup
          value={selected}
          onValueChange={v => setSelected(v as ServerOption)}
          className="gap-0 overflow-hidden rounded-lg border"
        >
          <label
            htmlFor="server-production"
            className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 active:bg-muted"
          >
            <RadioGroupItem value="production" id="server-production" />
            <div>
              <p className="text-sm">{t('server_picker.option_production')}</p>
              <p className="font-mono text-xs text-muted-foreground">{SERVERS.production}</p>
            </div>
          </label>

          <div className="h-px bg-border" />

          <label
            htmlFor="server-development"
            className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 active:bg-muted"
          >
            <RadioGroupItem value="development" id="server-development" />
            <div>
              <p className="text-sm">{t('server_picker.option_development')}</p>
              <p className="font-mono text-xs text-muted-foreground">{SERVERS.development}</p>
            </div>
          </label>

          <div className="h-px bg-border" />

          <label
            htmlFor="server-custom"
            className="flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50 active:bg-muted"
          >
            <RadioGroupItem value="custom" id="server-custom" className="mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-sm">{t('server_picker.option_custom')}</p>
              <Input
                className="mt-2 font-mono text-xs"
                placeholder={t('server_picker.custom_placeholder')}
                disabled={selected !== 'custom'}
                value={customUrl}
                onChange={e => setCustomUrl(e.target.value)}
                onClick={e => e.stopPropagation()}
                onKeyDown={e => { if (e.key === 'Enter' && isValid) handleConnect(); }}
              />
            </div>
          </label>
        </RadioGroup>

        <Button className="w-full" disabled={!isValid} onClick={handleConnect}>
          {t('server_picker.connect')}
        </Button>

      </div>
    </div>
  );
}
