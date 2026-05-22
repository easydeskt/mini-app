import {
  backButton,
  initData,
  init as initSDK,
  miniApp,
  setDebug,
  themeParams,
  viewport,
} from '@telegram-apps/sdk-react';

export function init(debug: boolean): void {
  setDebug(debug);
  initSDK();

  backButton.mount.ifAvailable();
  initData.restore();

  if (miniApp.mountSync.isAvailable()) {
    miniApp.mountSync();
    themeParams.bindCssVars();
  }

  if (viewport.mount.isAvailable()) {
    void viewport.mount().then(() => {
      viewport.bindCssVars();
    });
  }
}
