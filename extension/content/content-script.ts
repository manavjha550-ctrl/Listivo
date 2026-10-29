import { detectMarketplace } from './marketplace-detector';
import { MessageAction, sendExtensionMessage } from '../shared/messaging';
import { MarketplaceDetection } from '../shared/types';
import { ListivoFloatingPanel } from './ui/ListivoFloatingPanel';

(function initListivoContentScript() {
  if ((window as any).__LISTIVO_CONTENT_SCRIPT_INITIALIZED__) {
    return;
  }
  (window as any).__LISTIVO_CONTENT_SCRIPT_INITIALIZED__ = true;

  const detection: MarketplaceDetection = detectMarketplace(window.location.hostname);

  // 1. Notify background worker of detected marketplace
  sendExtensionMessage({
    action: MessageAction.MARKETPLACE_DETECTED,
    payload: {
      detection,
      url: window.location.href,
    },
  }).catch(() => {});

  // 2. Only inject floating UI if on a supported/recognized marketplace
  if (detection.marketplace === 'UNKNOWN') {
    return;
  }

  // Ensure root doesn't duplicate
  if (document.getElementById('listivo-extension-root')) {
    return;
  }

  const container = document.createElement('div');
  container.id = 'listivo-extension-root';
  container.style.position = 'fixed';
  container.style.bottom = '24px';
  container.style.right = '24px';
  container.style.zIndex = '999999';
  container.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  // Attach Shadow DOM to insulate styles from target marketplace page
  const shadow = container.attachShadow({ mode: 'open' });
  document.body.appendChild(container);

  // Instantiate & initialize Phase 8B Floating Panel
  const panel = new ListivoFloatingPanel(shadow);
  panel.init();
})();

