import { STORAGE_KEYS, DEFAULT_SERVER_URL } from './constants';
import { ExtensionSellerProfile, ExtensionSettings, ExtensionAuthState } from './types';

export const extensionStorage = {
  async getAuthToken(): Promise<string | null> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise<string | null>((resolve) => {
        chrome.storage.local.get([STORAGE_KEYS.AUTH_TOKEN], (result) => {
          resolve((result[STORAGE_KEYS.AUTH_TOKEN] as string) || null);
        });
      });
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    }
    return null;
  },

  async setAuthToken(token: string | null): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        if (token) {
          chrome.storage.local.set({ [STORAGE_KEYS.AUTH_TOKEN]: token }, () => resolve());
        } else {
          chrome.storage.local.remove([STORAGE_KEYS.AUTH_TOKEN], () => resolve());
        }
      });
    }
    if (typeof localStorage !== 'undefined') {
      if (token) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      }
    }
  },

  async getSeller(): Promise<ExtensionSellerProfile | null> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise<ExtensionSellerProfile | null>((resolve) => {
        chrome.storage.local.get([STORAGE_KEYS.SELLER_DATA], (result) => {
          resolve((result[STORAGE_KEYS.SELLER_DATA] as ExtensionSellerProfile) || null);
        });
      });
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEYS.SELLER_DATA);
      try {
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    }
    return null;
  },

  async setSeller(seller: ExtensionSellerProfile | null): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        if (seller) {
          chrome.storage.local.set({ [STORAGE_KEYS.SELLER_DATA]: seller }, () => resolve());
        } else {
          chrome.storage.local.remove([STORAGE_KEYS.SELLER_DATA], () => resolve());
        }
      });
    }
    if (typeof localStorage !== 'undefined') {
      if (seller) {
        localStorage.setItem(STORAGE_KEYS.SELLER_DATA, JSON.stringify(seller));
      } else {
        localStorage.removeItem(STORAGE_KEYS.SELLER_DATA);
      }
    }
  },

  async getSettings(): Promise<ExtensionSettings> {
    const defaultSettings: ExtensionSettings = {
      serverUrl: DEFAULT_SERVER_URL,
      connectionStatus: 'NOT_CONNECTED',
      marketplaceDetectionEnabled: true,
      isDevMode: true,
    };

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise<ExtensionSettings>((resolve) => {
        chrome.storage.local.get([STORAGE_KEYS.SETTINGS], (result) => {
          const stored = (result[STORAGE_KEYS.SETTINGS] as ExtensionSettings) || {};
          resolve({ ...defaultSettings, ...stored });
        });
      });
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      try {
        return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  },

  async saveSettings(settings: Partial<ExtensionSettings>): Promise<ExtensionSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: updated }, () => resolve(updated));
      });
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    }
    return updated;
  },

  async clearSession(): Promise<void> {
    await this.setAuthToken(null);
    await this.setSeller(null);
    await this.saveSettings({ connectionStatus: 'NOT_CONNECTED' });
  },
};
