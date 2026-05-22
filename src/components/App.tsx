import { useEffect } from 'react';

import { miniApp, useSignal } from '@telegram-apps/sdk-react';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';

import { router } from 'src/navigation/routes.tsx';

export function App() {
  const isDark = useSignal(miniApp.isDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--background-hex').trim();
    const color: `#${string}` | 'bg_color' = raw.startsWith('#') ? (raw as `#${string}`) : 'bg_color';
    if (miniApp.setHeaderColor.isAvailable()) {
      try { miniApp.setHeaderColor(color); } catch { miniApp.setHeaderColor('bg_color'); }
    }
    if (miniApp.setBackgroundColor.isAvailable()) {
      try { miniApp.setBackgroundColor(color); } catch { miniApp.setBackgroundColor('bg_color'); }
    }
    if (miniApp.setBottomBarColor.isAvailable()) {
      try { miniApp.setBottomBarColor(color); } catch { miniApp.setBottomBarColor('bg_color'); }
    }
  }, [isDark]);

  return (
    <>
      <Toaster theme={isDark ? 'dark' : 'light'} position="top-center" />
      <RouterProvider router={router} />
    </>
  );
}
