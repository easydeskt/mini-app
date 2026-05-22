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
    if (miniApp.setHeaderColor.isAvailable()) miniApp.setHeaderColor('bg_color');
    if (miniApp.setBackgroundColor.isAvailable()) miniApp.setBackgroundColor('bg_color');
    if (miniApp.setBottomBarColor.isAvailable()) miniApp.setBottomBarColor('bg_color');
  }, [isDark]);

  return (
    <>
      <Toaster theme={isDark ? 'dark' : 'light'} position="top-center" />
      <RouterProvider router={router} />
    </>
  );
}
