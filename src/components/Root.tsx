import { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initData } from '@telegram-apps/sdk-react';

import { DEV_SERVER_KEY } from '@/api/client';
import { Button } from '@/components/ui/button';
import { createT } from '@/i18n';

import { App } from 'src/components/App.tsx';
import { DevServerPicker } from 'src/components/DevServerPicker.tsx';
import { ErrorBoundary } from 'src/components/ErrorBoundary.tsx';
import { ErrorScreen } from 'src/components/ErrorScreen.tsx';

function getLang() {
  return initData.user()?.language_code === 'ru' ? 'ru' : 'en';
}

const queryClient = new QueryClient();

function ErrorBoundaryError({ error }: { error: unknown }) {
  const t = createT(getLang());
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : JSON.stringify(error);

  return (
    <ErrorScreen
      title={t('common.error_title')}
      description={message}
      descriptionClassName="font-mono"
      action={<Button onClick={() => window.location.reload()}>{t('common.error_retry')}</Button>}
    />
  );
}

export function Root() {
  const [serverReady, setServerReady] = useState(
    !import.meta.env.DEV || !!localStorage.getItem(DEV_SERVER_KEY),
  );

  if (!serverReady) {
    return <DevServerPicker onConnect={() => setServerReady(true)} />;
  }

  return (
    <ErrorBoundary fallback={ErrorBoundaryError}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
