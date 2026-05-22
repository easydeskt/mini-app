import { createContext, useContext, useState, type ReactNode } from 'react';

import { initData } from '@telegram-apps/sdk-react';


export type Language = 'ru' | 'en';
export type Theme = 'system' | 'light' | 'dark';

type PreferencesContextValue = {
  language: Language;
  theme: Theme;
  setLanguage: (l: Language) => void;
  setTheme: (t: Theme) => void;
};

export const PreferencesContext = createContext<PreferencesContextValue>({
  language: 'ru',
  theme: 'system',
  setLanguage: () => {},
  setTheme: () => {},
});

export function usePreferences() {
  return useContext(PreferencesContext);
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('pref:language') as Language | null;
    if (saved) return saved;
    const tgLang = initData.user()?.language_code;
    return tgLang === 'en' ? 'en' : 'ru';
  });
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem('pref:theme') as Theme | null) ?? 'system',
  );

  function setLanguage(l: Language) {
    localStorage.setItem('pref:language', l);
    setLanguageState(l);
  }

  function setTheme(t: Theme) {
    localStorage.setItem('pref:theme', t);
    setThemeState(t);
  }

  return (
    <PreferencesContext.Provider value={{ language, theme, setLanguage, setTheme }}>
      {children}
    </PreferencesContext.Provider>
  );
}
