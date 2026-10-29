export type FieldFillStatus =
  | 'SUCCESS'
  | 'SKIPPED'
  | 'FAILED'
  | 'NOT_FOUND'
  | 'NOT_SUPPORTED'
  | 'MANUAL_CONFIRMATION_REQUIRED';

export interface FieldFillResult {
  fieldKey: string;
  fieldLabel: string;
  status: FieldFillStatus;
  appliedValue?: any;
  existingValue?: any;
  reason?: string;
}

export type PageType =
  | 'MEESHO_LOGIN_PAGE'
  | 'MEESHO_DASHBOARD'
  | 'MEESHO_CATALOG_PAGE'
  | 'MEESHO_LISTING_FORM'
  | 'MEESHO_OTHER_PAGE'
  | 'UNKNOWN';

export interface PageDetectionResult {
  isSupported: boolean;
  isListingForm: boolean;
  isLoggedIn: boolean;
  pageType: PageType;
  pageState: 'FORM_READY' | 'FORM_NOT_FOUND' | 'LOGIN_REQUIRED' | 'UNSUPPORTED_PAGE';
  details: string;
}

export interface OverwriteOptions {
  overwritePolicy: 'EMPTY_ONLY' | 'REPLACE_ALL';
}

export interface MarketplaceAdapter {
  marketplaceName: string;
  detectPage(): PageDetectionResult;
  getAvailableFields(): string[];
  findField(fieldKey: string): HTMLElement | null;
  getCurrentValue(fieldKey: string): string | null;
  fillField(
    fieldKey: string,
    value: any,
    options?: OverwriteOptions
  ): Promise<FieldFillResult>;
  verifyField(fieldKey: string, expectedValue: any): Promise<boolean>;
  supportsField(fieldKey: string): boolean;
}
