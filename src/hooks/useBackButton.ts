import { useEffect } from 'react';

import { backButton } from '@telegram-apps/sdk-react';
import { useNavigate } from 'react-router';

export function useBackButton() {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      if (!backButton.isMounted()) backButton.mount();
    } catch {
      // backButton may not be available in this environment
    }

    backButton.show();

    const handleBack = () => void navigate(-1);
    backButton.onClick(handleBack);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') void navigate(-1);
    }
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      backButton.hide();
      backButton.offClick(handleBack);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);
}
