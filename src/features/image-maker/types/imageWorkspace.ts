export type ImageValidationStatus = 'VALID' | 'WARNING' | 'ERROR' | 'UNVERIFIED';

export interface ImageSlotItem {
  id: string;
  url: string;
  position: number; // 1-indexed
  isPrimary: boolean;
  title?: string;
  altText?: string;
  validationStatus: ImageValidationStatus;
  validationMessage?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  fileType?: string;
  estimatedSizeKb?: number;
  variantId?: string;
  variantSku?: string;
  createdAt?: string;
}

export interface MarketplaceImageRequirement {
  marketplaceId: string;
  marketplaceName: string;
  maxSlots: number;
  minWidth: number;
  minHeight: number;
  recommendedAspect: string;
  allowedFormats: string[];
  maxSizeMb: number;
}

export const MARKETPLACE_CONFIGURED_RULES: Record<string, MarketplaceImageRequirement> = {
  meesho: {
    marketplaceId: 'meesho',
    marketplaceName: 'Meesho',
    maxSlots: 6,
    minWidth: 500,
    minHeight: 500,
    recommendedAspect: '1:1',
    allowedFormats: ['JPG', 'JPEG', 'PNG', 'WEBP'],
    maxSizeMb: 5,
  },
  flipkart: {
    marketplaceId: 'flipkart',
    marketplaceName: 'Flipkart',
    maxSlots: 8,
    minWidth: 800,
    minHeight: 800,
    recommendedAspect: '1:1',
    allowedFormats: ['JPG', 'JPEG', 'PNG'],
    maxSizeMb: 10,
  },
  amazon: {
    marketplaceId: 'amazon',
    marketplaceName: 'Amazon IN',
    maxSlots: 9,
    minWidth: 1000,
    minHeight: 1000,
    recommendedAspect: '1:1',
    allowedFormats: ['JPG', 'JPEG', 'PNG', 'GIF'],
    maxSizeMb: 10,
  },
  myntra: {
    marketplaceId: 'myntra',
    marketplaceName: 'Myntra',
    maxSlots: 7,
    minWidth: 1080,
    minHeight: 1440,
    recommendedAspect: '3:4',
    allowedFormats: ['JPG', 'JPEG', 'PNG'],
    maxSizeMb: 8,
  },
};

export interface ProcessImageOptions {
  width?: number;
  height?: number;
  cropArea?: { x: number; y: number; w: number; h: number };
  format?: 'jpeg' | 'png' | 'webp';
  quality?: number; // 0.1 to 1.0
}

export interface ProcessedImageResult {
  processedUrl: string;
  originalDimensions: { w: number; h: number };
  processedDimensions: { w: number; h: number };
  originalSizeEstKb: number;
  processedSizeEstKb: number;
  format: string;
}
