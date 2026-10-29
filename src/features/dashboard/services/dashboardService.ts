import { DashboardStats, ExtensionConnectionInfo } from '../types/dashboard';
import { ActivityItem } from '../../../types';
import { apiFetch } from '../../../lib/apiClient';

export const dashboardService = {
  /**
   * Fetch current user's listing statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [tplRes, prodRes] = await Promise.all([
        apiFetch('/api/templates').catch(() => null),
        apiFetch('/api/products').catch(() => null),
      ]);

      let totalTemplates = 0;
      let totalListings = 0;
      let draftListings = 0;
      let readyListings = 0;
      let exportedListings = 0;

      if (tplRes && tplRes.ok) {
        const tplData = await tplRes.json();
        if (tplData.success && Array.isArray(tplData.data)) {
          totalTemplates = tplData.data.length;
        }
      }

      if (prodRes && prodRes.ok) {
        const prodData = await prodRes.json();
        if (prodData.success && Array.isArray(prodData.data)) {
          totalListings = prodData.data.length;
          draftListings = prodData.data.filter((p: any) => p.status === 'DRAFT' || p.status === 'INCOMPLETE').length;
          readyListings = prodData.data.filter((p: any) => p.status === 'READY').length;
          exportedListings = prodData.data.filter((p: any) => p.status === 'EXPORTED').length;
        }
      }

      // 15 minutes saved per ready or exported listing, 20 mins per template
      const minutesSaved = (readyListings + exportedListings) * 15 + totalTemplates * 20;
      const estimatedTimeSavedHours = Number((minutesSaved / 60).toFixed(1));

      return {
        totalTemplates,
        totalListings,
        draftListings,
        readyListings,
        exportedListings,
        estimatedTimeSavedHours,
      };
    } catch (err) {
      console.warn('Dashboard stats API error:', err);
      return {
        totalTemplates: 0,
        totalListings: 0,
        draftListings: 0,
        readyListings: 0,
        exportedListings: 0,
        estimatedTimeSavedHours: 0,
      };
    }
  },

  /**
   * Fetch recent activity log
   */
  async getRecentActivities(): Promise<ActivityItem[]> {
    try {
      const res = await apiFetch('/api/activities');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          return data.data.map((item: any) => ({
            id: item.id,
            userId: item.userId,
            type: item.activityType || 'template_created',
            title: item.title,
            description: item.description,
            timestamp: item.createdAt || new Date().toISOString(),
            metadata: item.metadata,
          }));
        }
      }
    } catch (err) {
      console.warn('Recent activities API error:', err);
    }

    return [];
  },

  /**
   * Check Extension status accurately from server handshake
   */
  async getExtensionStatus(): Promise<ExtensionConnectionInfo> {
    try {
      const res = await apiFetch('/api/extension/status');
      if (res.ok) {
        const data = await res.json();
        if (data.extensionConnected && data.status === 'CONNECTED') {
          return {
            status: 'CONNECTED',
            version: 'v1.0.0',
            lastSyncedAt: data.serverTime || new Date().toISOString(),
            message: `Connected as ${data.user?.fullName || 'Seller'} (${data.user?.companyName || 'Store Panel'})`,
          };
        } else if (data.status === 'SESSION_EXPIRED') {
          return {
            status: 'SESSION_EXPIRED',
            message: 'Your seller session has expired. Please log in again to authenticate the extension.',
          };
        } else {
          return {
            status: 'NOT_CONNECTED',
            message: 'Extension not connected. Load unpacked extension from /extension/dist/ to activate.',
          };
        }
      } else if (res.status === 401) {
        return {
          status: 'SESSION_EXPIRED',
          message: 'Your session has expired. Please sign in to reconnect your extension.',
        };
      }
    } catch (err) {
      console.warn('Extension status check error:', err);
      return {
        status: 'CONNECTION_ERROR',
        message: 'Unable to reach LISTIVO extension handshake server.',
      };
    }

    return {
      status: 'NOT_CONNECTED',
      message: 'LISTIVO Chrome Extension is not installed or not connected.',
    };
  },
};
