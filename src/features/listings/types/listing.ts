import { TemplateAttribute } from '../../templates/types/template';

export interface ListingVariant {
  id: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  mrp?: number;
  stock: number;
  costPrice?: number;
  weightGrams?: number;
  imageUrl?: string;
  status?: string;
}

export interface ListingImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
}

export interface ValidationIssue {
  field: string;
  section: string;
  severity: 'error' | 'warning';
  message: string;
}

export interface ValidationResults {
  isValid: boolean;
  validCount: number;
  warningCount: number;
  errorCount: number;
  issues: ValidationIssue[];
}

export interface ProductListing {
  id: string;
  userId: string;
  templateId?: string;
  templateName?: string;
  title: string;
  sku: string;
  styleId?: string;
  marketplace: 'meesho' | 'flipkart' | 'amazon' | 'meesho_top' | string;
  category: string;
  subCategory?: string;
  brand: string;
  material?: string;
  description: string;
  keyFeatures?: string[];
  mrp: number;
  sellingPrice: number;
  costPrice?: number;
  discountPercent?: number;
  stock: number;
  gstRate: number;
  hsnCode: string;
  weightGrams: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  returnPolicy?: string;
  careInstructions?: string;
  status: 'DRAFT' | 'INCOMPLETE' | 'READY' | 'EXPORTED';
  images?: ListingImage[];
  primaryImageIndex?: number;
  attributes?: TemplateAttribute[];
  variantDimensions?: Array<{ id: string; name: string; options: string[] }>;
  variants?: ListingVariant[];
  variantsCount: number;
  platformMappings?: Record<string, Record<string, string>>;
  validationResults?: ValidationResults;
  createdAt: string;
  updatedAt: string;
}

export interface ListingFilters {
  search: string;
  category: string;
  marketplace: string;
  status: string;
  sort: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'title_asc' | 'variants_desc';
}

export interface ListingStats {
  total: number;
  ready: number;
  draft: number;
  incomplete: number;
  exported: number;
}

export interface GenerateAIDescriptionInput {
  title: string;
  brand: string;
  category: string;
  subCategory?: string;
  material?: string;
  keyFeatures?: string[];
  attributes?: TemplateAttribute[];
  tone: 'professional' | 'seo' | 'festive' | 'concise';
}
