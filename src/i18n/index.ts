import { en } from './translations/en';
import { ru } from './translations/ru';

export type Language = 'ru' | 'en';

type TranslationValue = string | { [key: string]: TranslationValue };

const translations: Record<Language, Record<string, TranslationValue>> = { en, ru };

function resolve(dict: Record<string, TranslationValue>, keys: string[]): string | undefined {
  let current: TranslationValue | undefined = dict;
  for (const k of keys) {
    if (!current || typeof current !== 'object') return undefined;
    current = (current as Record<string, TranslationValue>)[k];
  }
  return typeof current === 'string' ? current : undefined;
}

export function createT(lang: Language) {
  const dict = translations[lang] as Record<string, TranslationValue>;
  return (key: string): string => resolve(dict, key.split('.')) ?? key;
}
