import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initData } from '@telegram-apps/sdk-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { createT } from '@/i18n';

import { App } from 'src/components/App.tsx';
import { ErrorBoundary } from 'src/components/ErrorBoundary.tsx';
import { ErrorScreen } from 'src/components/ErrorScreen.tsx';

function getLang() {
  return initData.user()?.language_code === 'ru' ? 'ru' : 'en';
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      const t = createT(getLang());
      let toastId: string;
      let message: string;
      if (error instanceof TypeError) {
        toastId = navigator.onLine ? 'server_unavailable' : 'network_error';
        message = t(`common.${toastId}`) ?? error.message;
      } else {
        message = error instanceof Error ? error.message : String(error);
        toastId = message;
      }
      toast.error(message, { id: toastId });
    },
  }),
});

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
