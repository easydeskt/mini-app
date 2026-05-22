import { usePreferences } from '@/context/PreferencesContext';
import { createT } from '@/i18n';

export function useChannelT(brand: string) {
  const { language } = usePreferences();
  const t = createT(language);
  const sk = (key: string) => (!key || key === '__basic__' || key === '__extras__' ? 'root' : key);

  return {
    sectionTitle: (key: string) => {
      if (key === '__basic__') return t('channels.section_basic') ?? 'Basic';
      if (key === '__extras__') return t('channels.section_extras') ?? 'Extras';
      return t(`channel.${brand}.section_${sk(key)}`) ?? key;
    },
    fieldLabel: (section: string, field: string) => t(`channel.${brand}.${sk(section)}_${field}_label`) ?? field,
    fieldDescription: (section: string, field: string) => t(`channel.${brand}.${sk(section)}_${field}_description`),
    brandDescription: () => t(`channel.${brand}.description`),
  };
}
