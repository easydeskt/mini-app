import { initData } from '@telegram-apps/sdk-react';

export function useLang(): 'ru' | 'en' {
  try {
    return initData.user()?.language_code === 'ru' ? 'ru' : 'en';
  } catch {
    return 'en';
  }
}
