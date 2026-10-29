import { ActivityItem } from '../../../types';

export interface DashboardStats {
  totalTemplates: number;
  totalListings: number;
  draftListings: number;
  readyListings: number;
  exportedListings: number;
  estimatedTimeSavedHours: number;
}

export interface SetupStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  isCompleted: boolean;
  actionLabel: string;
  actionRoute: string;
}

export type ExtensionConnectionState = 'CONNECTED' | 'NOT_CONNECTED' | 'SESSION_EXPIRED' | 'CONNECTION_ERROR';

export interface ExtensionConnectionInfo {
  status: ExtensionConnectionState;
  version?: string;
  lastSyncedAt?: string;
  message: string;
}

export interface RecentActivityData {
  activities: ActivityItem[];
}
