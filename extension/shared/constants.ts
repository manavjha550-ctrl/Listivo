import { MarketplaceDetection, MarketplaceType } from './types';

export const DEFAULT_SERVER_URL =
  typeof window !== 'undefined' && window.location && window.location.origin.includes('http')
    ? window.location.origin
    : 'http://localhost:3000';

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'listivo_auth_token',
  SELLER_DATA: 'listivo_seller_data',
  SETTINGS: 'listivo_settings',
  LAST_STATE: 'listivo_last_auth_state',
};

export const MARKETPLACE_CONFIGS: Record<
  MarketplaceType,
  {
    label: string;
    supported: boolean;
    autofillStatus: string;
    domainRegex: RegExp;
  }
> = {
  MEESHO: {
    label: 'Meesho Supplier Panel',
    supported: true,
    autofillStatus: 'SUPPORTED — AUTOFILL COMING IN PHASE 8B',
    domainRegex: /supplier\.meesho\.com|meesho\.com/i,
  },
  FLIPKART: {
    label: 'Flipkart Seller Hub',
    supported: false,
    autofillStatus: 'DETECTED — AUTOFILL NOT IMPLEMENTED',
    domainRegex: /seller\.flipkart\.com|flipkart\.com/i,
  },
  AMAZON: {
    label: 'Amazon Seller Central',
    supported: false,
    autofillStatus: 'DETECTED — AUTOFILL NOT IMPLEMENTED',
    domainRegex: /sellercentral\.amazon\.in|amazon\.in/i,
  },
  MYNTRA: {
    label: 'Myntra Partner Portal',
    supported: false,
    autofillStatus: 'DETECTED — AUTOFILL NOT IMPLEMENTED',
    domainRegex: /partners\.myntra\.com|myntra\.com/i,
  },
  UNKNOWN: {
    label: 'Unknown Portal',
    supported: false,
    autofillStatus: 'NOT A SUPPORTED MARKETPLACE',
    domainRegex: /^$/,
  },
};
