import { MARKETPLACE_CONFIGS } from '../shared/constants';
import { MarketplaceDetection, MarketplaceType } from '../shared/types';

export function detectMarketplace(hostnameInput?: string): MarketplaceDetection {
  const hostname = (hostnameInput || (typeof window !== 'undefined' ? window.location.hostname : '')).toLowerCase();

  for (const [type, config] of Object.entries(MARKETPLACE_CONFIGS)) {
    if (type === 'UNKNOWN') continue;
    if (config.domainRegex.test(hostname)) {
      return {
        marketplace: type as MarketplaceType,
        supported: config.supported,
        hostname,
        label: config.label,
        autofillStatus: config.autofillStatus,
      };
    }
  }

  return {
    marketplace: 'UNKNOWN',
    supported: false,
    hostname,
    label: MARKETPLACE_CONFIGS.UNKNOWN.label,
    autofillStatus: MARKETPLACE_CONFIGS.UNKNOWN.autofillStatus,
  };
}
