export type ExtensionAuthState =
  | 'NOT_CONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'SESSION_EXPIRED'
  | 'ERROR';

export type MarketplaceType = 'MEESHO' | 'FLIPKART' | 'AMAZON' | 'MYNTRA' | 'UNKNOWN';

export interface MarketplaceDetection {
  marketplace: MarketplaceType;
  supported: boolean;
  hostname: string;
  label: string;
  autofillStatus: string;
}

export interface ExtensionSellerProfile {
  id: string;
  email: string;
  fullName: string;
  companyName: string;
  role: string;
  plan: string;
  isOwner: boolean;
  profileComplete: boolean;
  avatarUrl?: string;
  pickupPincode?: string;
  gstin?: string;
}

export interface ExtensionTemplateAttribute {
  key: string;
  label: string;
  value: string | number;
  isRequired?: boolean;
}

export interface ExtensionVariantDimension {
  name: string;
  options: string[];
}

export interface ExtensionTemplateDTO {
  id: string;
  name: string;
  marketplace: string;
  category: string;
  subCategory?: string;
  brand?: string;
  productType?: string;
  material?: string;
  color?: string;
  pattern?: string;
  description?: string;
  keyFeatures?: string[];
  gstRate?: number;
  hsnCode?: string;
  weightGrams?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  defaultPrice?: number;
  mrp?: number;
  discountPercent?: number;
  returnPolicy?: string;
  careInstructions?: string;
  skuPrefix?: string;
  tags?: string[];
  images?: string[];
  primaryImageIndex?: number;
  attributes?: ExtensionTemplateAttribute[];
  variantDimensions?: ExtensionVariantDimension[];
  listingsCount?: number;
  status?: string;
  updatedAt?: string;
}

export interface ExtensionListingDTO {
  id: string;
  templateId?: string;
  templateName?: string;
  title: string;
  sku: string;
  styleId?: string;
  marketplace: string;
  category: string;
  subCategory?: string;
  brand?: string;
  material?: string;
  description?: string;
  keyFeatures?: string[];
  mrp: number;
  sellingPrice: number;
  costPrice?: number;
  stock?: number;
  gstRate?: number;
  hsnCode?: string;
  status: string;
  images?: Array<{ id: string; url: string; isPrimary: boolean }>;
  attributes?: ExtensionTemplateAttribute[];
  variantsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExtensionSettings {
  serverUrl: string;
  connectionStatus: ExtensionAuthState;
  marketplaceDetectionEnabled: boolean;
  lastConnectedAt?: string;
  isDevMode?: boolean;
}

export interface ExtensionApiResponse<T = any> {
  success: boolean;
  data?: T;
  user?: ExtensionSellerProfile;
  error?: string;
  message?: string;
  status?: string;
  extensionConnected?: boolean;
  supportedMarketplaces?: string[];
  serverTime?: string;
}
