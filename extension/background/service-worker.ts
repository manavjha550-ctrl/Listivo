import { extensionApi } from '../shared/api';
import { extensionStorage } from '../shared/storage';
import { MessageAction, ExtensionMessageRequest, ExtensionMessageResponse } from '../shared/messaging';

// Initialize extension background worker
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onInstalled) {
  chrome.runtime.onInstalled.addListener((details) => {
    console.log('[LISTIVO Extension] Service Worker installed/updated:', details.reason);
  });
}

// Global Message Router
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener(
    (
      request: ExtensionMessageRequest,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response: ExtensionMessageResponse) => void
    ) => {
      handleMessage(request, sender)
        .then((response) => sendResponse(response))
        .catch((err) =>
          sendResponse({
            success: false,
            error: err.message || 'Background service worker failed to process message.',
          })
        );

      // Return true to signal async response
      return true;
    }
  );
}

async function handleMessage(
  request: ExtensionMessageRequest,
  sender: chrome.runtime.MessageSender
): Promise<ExtensionMessageResponse> {
  const { action, payload } = request;

  switch (action) {
    case MessageAction.GET_AUTH_STATUS: {
      const auth = await extensionApi.getAuthStatus();
      return {
        success: auth.status === 'CONNECTED',
        status: auth.status,
        user: auth.seller,
        message: auth.message,
      };
    }

    case MessageAction.CONNECT_LISTIVO: {
      const token = payload?.token;
      const res = await extensionApi.connectSession(token);
      return {
        success: res.success,
        status: res.status,
        user: res.seller,
        error: res.error,
      };
    }

    case MessageAction.DISCONNECT_LISTIVO: {
      await extensionApi.disconnectSession();
      return {
        success: true,
        status: 'NOT_CONNECTED',
        user: null,
        message: 'Successfully disconnected LISTIVO extension.',
      };
    }

    case MessageAction.GET_SELLER: {
      const seller = await extensionApi.getCurrentSeller();
      return {
        success: !!seller,
        user: seller,
        error: seller ? undefined : 'No authenticated seller found.',
      };
    }

    case MessageAction.GET_TEMPLATES: {
      const templates = await extensionApi.getTemplates();
      return {
        success: true,
        data: templates,
      };
    }

    case MessageAction.GET_TEMPLATE: {
      if (!payload?.templateId) {
        return { success: false, error: 'templateId is required.' };
      }
      const template = await extensionApi.getTemplateById(payload.templateId);
      return {
        success: !!template,
        data: template,
        error: template ? undefined : 'Template not found.',
      };
    }

    case MessageAction.GET_LISTING: {
      const listings = await extensionApi.getListings();
      return {
        success: true,
        data: listings,
      };
    }

    case MessageAction.LOG_ACTIVITY: {
      const ok = await extensionApi.logActivity(payload || {});
      return {
        success: ok,
      };
    }

    case MessageAction.MARKETPLACE_DETECTED: {
      console.log('[LISTIVO Worker] Marketplace detected:', payload?.detection?.label, 'at', sender.tab?.url || payload?.url);
      return {
        success: true,
        data: payload?.detection,
      };
    }

    default:
      return {
        success: false,
        error: `Unknown action: ${action}`,
      };
  }
}
