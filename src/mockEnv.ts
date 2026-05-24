import { emitEvent, isTMA, mockTelegramEnv } from '@telegram-apps/sdk-react';

if (import.meta.env.DEV) {
  if (!await isTMA('complete')) {
    const themeParams = {
      accent_text_color: '#3e88f7',
      bg_color: '#212121',
      button_color: '#3e88f7',
      button_text_color: '#ffffff',
      destructive_text_color: '#ef5350',
      header_bg_color: '#1c1c1e',
      hint_color: '#8d8d93',
      link_color: '#3e88f7',
      secondary_bg_color: '#1c1c1e',
      section_bg_color: '#2c2c2e',
      section_header_text_color: '#3e88f7',
      subtitle_text_color: '#8d8d93',
      text_color: '#ffffff',
    } as const;
    const noInsets = { left: 0, top: 0, bottom: 0, right: 0 } as const;

    mockTelegramEnv({
      onEvent([name]) {
        if (name === 'web_app_request_theme') {
          return emitEvent('theme_changed', { theme_params: themeParams });
        }
        if (name === 'web_app_request_viewport') {
          return emitEvent('viewport_changed', {
            height: window.innerHeight,
            width: window.innerWidth,
            is_expanded: true,
            is_state_stable: true,
          });
        }
        if (name === 'web_app_request_content_safe_area') {
          return emitEvent('content_safe_area_changed', noInsets);
        }
        if (name === 'web_app_request_safe_area') {
          return emitEvent('safe_area_changed', noInsets);
        }
      },
      launchParams: new URLSearchParams([
        ['tgWebAppThemeParams', JSON.stringify(themeParams)],
        ['tgWebAppData', new URLSearchParams([
          ['auth_date', (new Date().getTime() / 1000 | 0).toString()],
          ['hash', 'some-hash'],
          ['signature', 'some-signature'],
          ['user', JSON.stringify({ id: 1, first_name: 'Vladislav', username: 'soknight' })],
        ]).toString()],
        ['tgWebAppVersion', '8.4'],
        ['tgWebAppPlatform', 'tdesktop'],
      ]),
    });

    console.info(
      '⚠️ Environment mocked for development outside Telegram.',
    );
  }
}
