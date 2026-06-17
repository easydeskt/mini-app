import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initData } from '@telegram-apps/sdk-react';

import { MOCK_DEMO_VALUE, setDevServer } from '@/api/client';
import { Button } from '@/components/ui/button';
import { createT } from '@/i18n';
import { setupMockInterceptor } from '@/mocks/handler';

import { App } from 'src/components/App.tsx';
import { ErrorBoundary } from 'src/components/ErrorBoundary.tsx';
import { ErrorScreen } from 'src/components/ErrorScreen.tsx';

setDevServer(MOCK_DEMO_VALUE);
setupMockInterceptor();

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
  return (
    <ErrorBoundary fallback={ErrorBoundaryError}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
