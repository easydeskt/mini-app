import { createT, type Language } from '@/i18n';

export function EnvUnsupported() {
  const lang = (localStorage.getItem('pref:language') as Language | null) ?? 'ru';
  const t = createT(lang);

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
    </div>
  );
}
