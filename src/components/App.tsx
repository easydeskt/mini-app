import { useEffect } from 'react';

import { miniApp, useSignal } from '@telegram-apps/sdk-react';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';

import { usePreferences } from '@/context/PreferencesContext';
import { router } from 'src/navigation/routes.tsx';

function getBackgroundHex(): `#${string}` | null {
  const val = getComputedStyle(document.documentElement).getPropertyValue('--background-hex').trim();
  return val.startsWith('#') ? (val as `#${string}`) : null;
}

export function App() {
  const { theme } = usePreferences();
  const telegramIsDark = useSignal(miniApp.isDark);
  const isDark = theme === 'system' ? telegramIsDark : theme === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    const hex = getBackgroundHex();
    if (miniApp.setHeaderColor.isAvailable()) {
      try {
        miniApp.setHeaderColor(hex ?? 'bg_color');
      } catch {
        miniApp.setHeaderColor('bg_color');
      }
    }
    if (miniApp.setBackgroundColor.isAvailable()) miniApp.setBackgroundColor('bg_color');
    if (miniApp.setBottomBarColor.isAvailable()) {
      try {
        miniApp.setBottomBarColor(hex ?? 'bg_color');
      } catch {
        miniApp.setBottomBarColor('bg_color');
      }
    }
  }, [isDark]);

  return (
    <>
      <Toaster theme={isDark ? 'dark' : 'light'} position="top-center" />
      <RouterProvider router={router} />
    </>
  );
}
