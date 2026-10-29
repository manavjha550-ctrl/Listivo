import { extensionStorage } from './storage';
import {
  ExtensionApiResponse,
  ExtensionSellerProfile,
  ExtensionTemplateDTO,
  ExtensionListingDTO,
  ExtensionAuthState,
} from './types';

async function fetchFromApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ExtensionApiResponse<T>> {
  try {
    const settings = await extensionStorage.getSettings();
    const baseUrl = settings.serverUrl.replace(/\/+$/, '');
    const token = await extensionStorage.getAuthToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      await extensionStorage.clearSession();
      return {
        success: false,
        status: 'SESSION_EXPIRED',
        error: 'Your LISTIVO session has expired or is invalid. Please sign in again.',
      };
    }

    if (response.status === 403) {
      return {
        success: false,
        error: 'Forbidden. You do not have permission to access this seller resource.',
      };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `Server responded with status ${response.status}.`,
      };
    }

    const json = await response.json();
    return json;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error connecting to LISTIVO server.',
    };
  }
}

export const extensionApi = {
  /**
   * Check connection status with LISTIVO server
   */
  async getAuthStatus(): Promise<{
    status: ExtensionAuthState;
    seller: ExtensionSellerProfile | null;
    message?: string;
  }> {
    const token = await extensionStorage.getAuthToken();
    if (!token) {
      return { status: 'NOT_CONNECTED', seller: null, message: 'No active authentication session.' };
    }

    const res = await fetchFromApi<any>('/api/extension/status');
    if (res.success && res.user) {
      await extensionStorage.setSeller(res.user);
      await extensionStorage.saveSettings({ connectionStatus: 'CONNECTED', lastConnectedAt: new Date().toISOString() });
      return { status: 'CONNECTED', seller: res.user };
    }

    if (res.status === 'SESSION_EXPIRED' || !res.success) {
      await extensionStorage.clearSession();
      return { status: 'SESSION_EXPIRED', seller: null, message: res.error || 'Session expired.' };
    }

    return { status: 'NOT_CONNECTED', seller: null };
  },

  /**
   * Connect extension session by authenticating with token or credentials
   */
  async connectSession(tokenInput?: string): Promise<{
    success: boolean;
    status: ExtensionAuthState;
    seller: ExtensionSellerProfile | null;
    error?: string;
  }> {
    if (tokenInput) {
      await extensionStorage.setAuthToken(tokenInput);
    }

    const authCheck = await this.getAuthStatus();
    if (authCheck.status === 'CONNECTED' && authCheck.seller) {
      return {
        success: true,
        status: 'CONNECTED',
        seller: authCheck.seller,
      };
    }

    return {
      success: false,
      status: authCheck.status,
      seller: null,
      error: authCheck.message || 'Failed to authenticate extension session with LISTIVO.',
    };
  },

  /**
   * Disconnect active seller session
   */
  async disconnectSession(): Promise<void> {
    await extensionStorage.clearSession();
  },

  /**
   * Fetch current authenticated seller profile
   */
  async getCurrentSeller(): Promise<ExtensionSellerProfile | null> {
    const res = await fetchFromApi<ExtensionSellerProfile>('/api/extension/me');
    if (res.success && res.user) {
      await extensionStorage.setSeller(res.user);
      return res.user;
    }
    return null;
  },

  /**
   * Fetch seller-owned templates
   */
  async getTemplates(): Promise<ExtensionTemplateDTO[]> {
    const res = await fetchFromApi<ExtensionTemplateDTO[]>('/api/extension/templates');
    if (res.success && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  },

  /**
   * Fetch specific template by ID
   */
  async getTemplateById(templateId: string): Promise<ExtensionTemplateDTO | null> {
    const res = await fetchFromApi<ExtensionTemplateDTO>(`/api/extension/templates/${encodeURIComponent(templateId)}`);
    if (res.success && res.data) {
      return res.data;
    }
    return null;
  },

  /**
   * Fetch seller-owned listings
   */
  async getListings(): Promise<ExtensionListingDTO[]> {
    const res = await fetchFromApi<ExtensionListingDTO[]>('/api/extension/listings');
    if (res.success && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  },

  /**
   * Log extension activity event on server
   */
  async logActivity(payload: {
    type?: string;
    title?: string;
    description?: string;
    marketplace?: string;
    fieldsCount?: number;
  }): Promise<boolean> {
    const res = await fetchFromApi('/api/extension/activity', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return Boolean(res.success);
  },
};
