/**
 * LISTIVO Core Domain Types
 */

export type UserRole = 'owner' | 'admin' | 'user';

export type SubscriptionPlan = 'lifetime_free' | 'free' | 'starter' | 'pro' | 'enterprise';

export type SubscriptionStatus = 'active' | 'inactive' | 'trialing' | 'past_due' | 'canceled';

export type FeatureFlag =
  | 'templates'
  | 'products'
  | 'bulk'
  | 'keywords'
  | 'tools'
  | 'image_maker'
  | 'price_calculator'
  | 'smart_listings'
  | 'tutorials'
  | 'settings'
  | 'team'
  | 'extension';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  companyName: string;
  phone?: string;
  gstin?: string;
  pickupAddress?: string;
  pickupPincode?: string;
  profileComplete?: boolean;
  role: UserRole;
  plan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  isOwner: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  isOwnerOverride?: boolean;
}

export type Marketplace = 'meesho' | 'flipkart' | 'amazon' | 'meesho_catalog';

export interface TemplateAttribute {
  id: string;
  key: string;
  label: string;
  value: string;
  type: 'text' | 'select' | 'number' | 'boolean' | 'multiselect';
  options?: string[];
  isRequired: boolean;
}

export interface ListingTemplate {
  id: string;
  userId: string;
  name: string;
  marketplace: Marketplace;
  category: string;
  subCategory?: string;
  brand: string;
  material: string;
  description: string;
  gstRate: number;
  hsnCode: string;
  weightGrams: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  defaultPrice: number;
  mrp: number;
  returnPolicy: string;
  careInstructions: string;
  skuPrefix: string;
  tags: string[];
  attributes: TemplateAttribute[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProductStatus = 'DRAFT' | 'INCOMPLETE' | 'READY' | 'EXPORTED';

export interface ProductVariant {
  id: string;
  sku: string;
  color: string;
  size: string;
  stock: number;
  price: number;
  mrp: number;
  images: string[];
}

export interface ProductListing {
  id: string;
  userId: string;
  templateId?: string;
  title: string;
  sku: string;
  marketplace: Marketplace;
  category: string;
  brand: string;
  material: string;
  description: string;
  mrp: number;
  sellingPrice: number;
  stock: number;
  gstRate: number;
  hsnCode: string;
  weightGrams: number;
  status: ProductStatus;
  variantsCount: number;
  variants: ProductVariant[];
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityItem {
  id: string;
  userId: string;
  type: 'template_created' | 'listing_created' | 'csv_imported' | 'ai_generated' | 'extension_autofill' | 'calc_run';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ExtensionSession {
  isConnected: boolean;
  version?: string;
  lastSyncAt?: string;
  activeTabUrl?: string;
  detectedPage?: 'meesho_listing' | 'meesho_catalog' | 'other' | 'none';
}
