import {
  ExtensionAuthState,
  ExtensionSellerProfile,
  ExtensionTemplateDTO,
  ExtensionListingDTO,
  MarketplaceDetection,
} from './types';

export enum MessageAction {
  GET_AUTH_STATUS = 'GET_AUTH_STATUS',
  CONNECT_LISTIVO = 'CONNECT_LISTIVO',
  DISCONNECT_LISTIVO = 'DISCONNECT_LISTIVO',
  GET_SELLER = 'GET_SELLER',
  GET_TEMPLATES = 'GET_TEMPLATES',
  GET_TEMPLATE = 'GET_TEMPLATE',
  GET_LISTING = 'GET_LISTING',
  LOG_ACTIVITY = 'LOG_ACTIVITY',
  MARKETPLACE_DETECTED = 'MARKETPLACE_DETECTED',
  EXTENSION_READY = 'EXTENSION_READY',
}

export interface ExtensionMessageRequest<T = any> {
  action: MessageAction | string;
  payload?: T;
}

export interface ExtensionMessageResponse<T = any> {
  success: boolean;
  status?: ExtensionAuthState;
  user?: ExtensionSellerProfile | null;
  data?: T;
  error?: string;
  message?: string;
}

export interface MarketplaceDetectedPayload {
  detection: MarketplaceDetection;
  url: string;
}

export interface GetTemplatePayload {
  templateId: string;
}

export interface GetListingPayload {
  listingId: string;
}

/**
 * Utility to send typed messages safely to Chrome extension background script or content script
 */
export async function sendExtensionMessage<T = any, R = any>(
  message: ExtensionMessageRequest<T>
): Promise<ExtensionMessageResponse<R>> {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(message, (response: ExtensionMessageResponse<R>) => {
          if (chrome.runtime.lastError) {
            resolve({
              success: false,
              error: chrome.runtime.lastError.message || 'Extension runtime communication error.',
            });
          } else {
            resolve(response || { success: false, error: 'Empty message response received.' });
          }
        });
      } catch (err: any) {
        resolve({
          success: false,
          error: err.message || 'Failed to dispatch message to extension runtime.',
        });
      }
    });
  }

  // Fallback for non-extension / dev browser environments
  return {
    success: false,
    error: 'Chrome extension API runtime unavailable in standard window context.',
  };
}
