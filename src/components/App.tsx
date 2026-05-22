import { useEffect } from 'react';

import { miniApp, useSignal } from '@telegram-apps/sdk-react';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';

import { usePreferences } from '@/context/PreferencesContext';
import { router } from 'src/navigation/routes.tsx';

export function App() {
  const { theme } = usePreferences();
  const telegramIsDark = useSignal(miniApp.isDark);
  const isDark = theme === 'system' ? telegramIsDark : theme === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <>
      <Toaster theme={isDark ? 'dark' : 'light'} position="top-center" />
      <RouterProvider router={router} />
    </>
  );
}
