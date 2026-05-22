import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { PreferencesProvider, type Language } from '@/context/PreferencesContext';
import { createT, type Language as I18nLanguage } from '@/i18n';

import { App } from 'src/components/App.tsx';
import { ErrorBoundary } from 'src/components/ErrorBoundary.tsx';
import { ErrorScreen } from 'src/components/ErrorScreen.tsx';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      const lang = (localStorage.getItem('pref:language') as Language | null) ?? 'ru';
      const t = createT(lang);
      // TypeError = fetch() itself threw: no internet or host unreachable.
      // Plain Error = server responded with a non-2xx status; carry that message through.
      // Use a stable id per error category so concurrent query failures collapse into one toast.
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
  const lang = (localStorage.getItem('pref:language') as I18nLanguage | null) ?? 'ru';
  const t = createT(lang);
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
        <PreferencesProvider>
          <App />
        </PreferencesProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
