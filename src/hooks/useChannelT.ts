import { initData } from '@telegram-apps/sdk-react';

import { createT } from '@/i18n';

export function useChannelT(brand: string) {
  const lang = initData.user()?.language_code === 'ru' ? 'ru' : 'en';
  const t = createT(lang);
  const sk = (key: string) => (!key || key === '__basic__' || key === '__extras__' ? 'root' : key);

  const lookup = (key: string) => {
    const result = t(key);
    return result !== key ? result : undefined;
  };

  return {
    sectionTitle: (key: string) => {
      if (key === '__basic__') return t('channels.section_basic') ?? 'Basic';
      if (key === '__extras__') return t('channels.section_extras') ?? 'Extras';
      return lookup(`channel.${brand}.section_${sk(key)}`) ?? key;
    },
    fieldLabel: (section: string, field: string) => lookup(`channel.${brand}.${sk(section)}_${field}_label`) ?? field,
    fieldPlaceholder: (section: string, field: string) => lookup(`channel.${brand}.${sk(section)}_${field}_placeholder`),
    fieldDescription: (section: string, field: string) => lookup(`channel.${brand}.${sk(section)}_${field}_description`),
    brandDescription: () => lookup(`channel.${brand}.description`),
  };
}
