import { createT, type Language } from '@/i18n';

type EnvUnsupportedProps = {
  error?: unknown;
};

export function EnvUnsupported({ error }: EnvUnsupportedProps) {
  const lang = (localStorage.getItem('pref:language') as Language | null) ?? 'ru';
  const t = createT(lang);

  const errorText = error instanceof Error
    ? `${error.name}: ${error.message}`
    : error != null ? String(error) : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <img
        alt="Telegram sticker"
        src="https://xelene.me/telegram.gif"
        className="h-36 w-36"
      />
      <h1 className="text-xl font-semibold">{t('common.env_unsupported_title')}</h1>
      <p className="text-sm text-muted-foreground">
        {t('common.env_unsupported_description')}
      </p>
      {errorText && (
        <pre className="mt-2 max-w-full overflow-auto rounded bg-black/10 p-3 text-left text-xs text-red-500">
          {errorText}
        </pre>
      )}
    </div>
  );
}
