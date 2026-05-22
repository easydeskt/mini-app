import { initData } from '@telegram-apps/sdk-react';

import { createT } from '@/i18n';

export function useT() {
  const lang = initData.user()?.language_code === 'ru' ? 'ru' : 'en';
  return createT(lang);
}
