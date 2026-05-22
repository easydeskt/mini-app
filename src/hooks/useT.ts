import { createT } from '@/i18n';
import { usePreferences } from '@/context/PreferencesContext';

export function useT() {
  const { language } = usePreferences();
  return createT(language);
}
