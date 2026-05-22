import { useLocation, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { useT } from '@/hooks/useT';

import { ErrorScreen } from 'src/components/ErrorScreen.tsx';

export function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();
  const canGoBack = location.key !== 'default';

  return (
    <ErrorScreen
      title={t('common.not_found_title') ?? 'Page not found'}
      description={t('common.not_found_description') ?? 'This page does not exist.'}
      action={
        <Button
          onClick={() => {
            if (canGoBack) void navigate(-1);
            else void navigate('/');
          }}
        >
          {canGoBack ? (t('common.not_found_back') ?? 'Go back') : (t('common.not_found_home') ?? 'Home')}
        </Button>
      }
    />
  );
}
