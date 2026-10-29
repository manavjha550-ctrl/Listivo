/**
 * Backend Data Models & In-Memory Store Foundation for Listivo
 */

export interface DBUser {
  id: string;
  email: string;
  passwordHash: string;
  role: 'owner' | 'admin' | 'user';
  plan: 'lifetime_free' | 'free' | 'starter' | 'pro';
  subscriptionStatus: 'active' | 'inactive' | 'trialing';
  isOwner: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DBProfile {
  id: string;
  userId: string;
  fullName: string;
  companyName: string;
  phone?: string;
  gstin?: string;
  pickupAddress?: string;
  pickupPincode?: string;
  profileComplete?: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBTemplateAttribute {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'number' | 'dropdown' | 'multiselect' | 'boolean' | 'date' | 'url';
  value: any;
  options?: string[];
  isRequired: boolean;
  isVariantDefining?: boolean;
}

export interface DBVariantDimension {
  id: string;
  name: string; // e.g. Color, Size, Material
  options: string[]; // e.g. ['Red', 'Blue'], ['S', 'M', 'L']
}

export interface DBTemplate {
  id: string;
  userId: string;
  name: string;
  marketplace: string; // meesho, flipkart, amazon, myntra
  category: string;
  subCategory?: string;
  brand: string;
  productType?: string;
  material: string;
  color?: string;
  pattern?: string;
  description: string;
  keyFeatures?: string[];
  gstRate: number;
  hsnCode: string;
  weightGrams: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  defaultPrice: number;
  mrp: number;
  discountPercent?: number;
  returnPolicy: string;
  careInstructions: string;
  skuPrefix: string;
  tags: string[];
  images?: string[];
  primaryImageIndex?: number;
  attributes: DBTemplateAttribute[];
  variantDimensions?: DBVariantDimension[];
  platformMappings?: Record<string, Record<string, string>>; // platform -> genericField -> mappedField
  listingsCount?: number;
  status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DBProductVariant {
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

export interface DBProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
}

export interface DBValidationResult {
  isValid: boolean;
  validCount: number;
  warningCount: number;
  errorCount: number;
  issues: Array<{
    field: string;
    section: string;
    severity: 'error' | 'warning';
    message: string;
  }>;
}

export interface DBProduct {
  id: string;
  userId: string;
  templateId?: string;
  templateName?: string;
  title: string;
  sku: string;
  styleId?: string;
  marketplace: string;
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
  images?: DBProductImage[];
  primaryImageIndex?: number;
  attributes?: DBTemplateAttribute[];
  variantDimensions?: DBVariantDimension[];
  variants?: DBProductVariant[];
  variantsCount: number;
  platformMappings?: Record<string, Record<string, string>>;
  validationResults?: DBValidationResult;
  createdAt: string;
  updatedAt: string;
}

export interface DBActivity {
  id: string;
  userId: string;
  activityType: string;
  title: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface DBBulkImportRow {
  id: string;
  importId: string;
  rowIndex: number;
  data: Record<string, any>;
  status: 'VALID' | 'WARNING' | 'ERROR' | 'MODIFIED' | 'UNCHANGED';
  errors: Array<{
    field: string;
    section: string;
    severity: 'error' | 'warning';
    message: string;
  }>;
}

export interface DBBulkImport {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  marketplace: string;
  templateId?: string;
  templateName?: string;
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
  importedRows: number;
  skippedRows: number;
  status: 'PROCESSING' | 'COMPLETED' | 'COMPLETED_WITH_WARNINGS' | 'FAILED' | 'CANCELLED';
  durationMs: number;
  rows?: DBBulkImportRow[];
  createdAt: string;
  updatedAt: string;
}

export interface DBPricingRule {
  id: string;
  userId: string;
  name: string;
  gstRate: number;
  packagingCost: number;
  shippingCost: number;
  marketplaceFee: number;
  marketplaceFeePercent: number;
  targetMargin: number;
  createdAt: string;
  updatedAt: string;
}

export interface DBColumnMappingPreset {
  id: string;
  userId: string;
  name: string;
  marketplace: string;
  mappings: Record<string, string>; // CSV column -> Listivo field
  createdAt: string;
}

export interface DBBulkExportJob {
  id: string;
  userId: string;
  fileName: string;
  format: 'csv' | 'xlsx';
  marketplace: string;
  totalRows: number;
  status: 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export interface DBAIJob {
  id: string;
  userId: string;
  jobType: 'bulk_listing_generate' | 'bulk_template_generate' | 'catalog_quality_audit' | 'title_batch' | 'description_batch';
  marketplace: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  totalItems: number;
  completedItems: number;
  failedItems: number;
  items: Array<{
    id: string;
    productId?: string;
    title?: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    result?: any;
    error?: string;
  }>;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface DBAIUsage {
  id: string;
  userId: string;
  feature: 'title' | 'description' | 'bullet' | 'keywords' | 'attributes' | 'smart_listing' | 'quality_audit' | 'refine' | 'bulk_job';
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  status: 'SUCCESS' | 'FAILED';
  createdAt: string;
}

export interface DBAIGenerationVersion {
  id: string;
  productId?: string;
  feature: 'title' | 'description' | 'bullet' | 'keywords' | 'attributes';
  previousValue: any;
  generatedValue: any;
  promptUsed?: string;
  qualityScore?: number;
  createdAt: string;
}

export interface DBSmartListingDraft {
  id: string;
  userId: string;
  title: string;
  sku: string;
  marketplace: string;
  category: string;
  brand: string;
  rawInput: string;
  generatedTitle: string;
  generatedDescription: string;
  generatedBullets: string[];
  generatedKeywords: { primary: string[]; secondary: string[]; longTail: string[]; related: string[] };
  generatedAttributes: Array<{ key: string; label: string; value: string }>;
  qualityScore: {
    overall: number;
    titleScore: number;
    descriptionScore: number;
    keywordScore: number;
    attributeScore: number;
    complianceScore: number;
    suggestions: string[];
  };
  status: 'DRAFT' | 'SAVED' | 'CONVERTED';
  createdAt: string;
  updatedAt: string;
}

// Default Seed Data with Owner Account
export const OWNER_EMAIL = process.env.OWNER_EMAIL || 'manavjha550@gmail.com';

export const INITIAL_USERS: DBUser[] = [
  {
    id: 'owner-uuid-1000-8000-000000000001',
    email: OWNER_EMAIL,
    passwordHash: 'owner_secure_hash',
    role: 'owner',
    plan: 'lifetime_free',
    subscriptionStatus: 'active',
    isOwner: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-uuid-2000-8000-000000000002',
    email: 'demo.seller@meesho.in',
    passwordHash: 'seller_secure_hash',
    role: 'user',
    plan: 'free',
    subscriptionStatus: 'inactive',
    isOwner: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_PROFILES: DBProfile[] = [
  {
    id: 'profile-owner-1',
    userId: 'owner-uuid-1000-8000-000000000001',
    fullName: 'Listivo Platform Owner',
    companyName: 'Listivo Technologies India',
    phone: '+91 98765 43210',
    gstin: '07AAAAA0000A1Z5',
    pickupAddress: 'Sector 62, Electronic City, Noida, UP',
    pickupPincode: '201301',
    profileComplete: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'profile-seller-2',
    userId: 'user-uuid-2000-8000-000000000002',
    fullName: 'Verified Seller',
    companyName: 'Seller Enterprise Store',
    phone: '+91 91234 56789',
    gstin: '27ABCDE1234F1Z2',
    pickupAddress: '42 Fashion Market, Chandni Chowk, Delhi',
    pickupPincode: '110006',
    profileComplete: true,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_TEMPLATES: DBTemplate[] = [
  {
    id: 'tpl-101',
    userId: 'owner-uuid-1000-8000-000000000001',
    name: 'Kurtis & Suits Standard',
    marketplace: 'meesho',
    category: 'Apparel',
    subCategory: 'Kurtis',
    brand: 'StyleCraft',
    productType: 'Straight Kurti',
    material: '100% Pure Rayon',
    color: 'Mustard Yellow',
    pattern: 'Printed Gold Foil',
    description: 'Premium quality printed kurti for festive & casual wear. Breathable rayon fabric with reinforced double stitching.',
    keyFeatures: [
      'Soft and breathable 100% Rayon fabric',
      'Elegant gold foil printed design',
      'Comfortable regular fit for daily wear',
      'Easy wash and color-fast material',
    ],
    gstRate: 5,
    hsnCode: '6204',
    weightGrams: 280,
    lengthCm: 28,
    widthCm: 22,
    heightCm: 4,
    defaultPrice: 499,
    mrp: 999,
    discountPercent: 50,
    returnPolicy: '7 Days Easy Return',
    careInstructions: 'Hand Wash or Machine Wash Cold',
    skuPrefix: 'KURTI-RAYON',
    tags: ['ethnic', 'kurti', 'festive', 'rayon', 'meesho_top_seller'],
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    ],
    primaryImageIndex: 0,
    attributes: [
      { id: 'attr-1', key: 'fabric', label: 'Fabric', type: 'dropdown', value: 'Rayon', options: ['Rayon', 'Cotton', 'Silk', 'Georgette'], isRequired: true, isVariantDefining: false },
      { id: 'attr-2', key: 'neck_type', label: 'Neck Type', type: 'dropdown', value: 'Round Neck', options: ['Round Neck', 'V-Neck', 'Mandarin Collar', 'Boat Neck'], isRequired: true, isVariantDefining: false },
      { id: 'attr-3', key: 'sleeve_length', label: 'Sleeve Length', type: 'dropdown', value: 'Three-Quarter Sleeves', options: ['Three-Quarter Sleeves', 'Full Sleeves', 'Short Sleeves', 'Sleeveless'], isRequired: true, isVariantDefining: false },
      { id: 'attr-4', key: 'fit', label: 'Fit Type', type: 'dropdown', value: 'Regular Fit', options: ['Regular Fit', 'Slim Fit', 'Straight', 'Anarkali'], isRequired: true, isVariantDefining: false },
    ],
    variantDimensions: [
      { id: 'vdim-1', name: 'Color', options: ['Mustard Yellow', 'Maroon Red', 'Royal Blue'] },
      { id: 'vdim-2', name: 'Size', options: ['S', 'M', 'L', 'XL', 'XXL'] },
    ],
    platformMappings: {
      meesho: { fabric: 'Fabric', neck_type: 'Neck/Collar', sleeve_length: 'Sleeve Length', fit: 'Fit/Shape' },
      flipkart: { fabric: 'Material', neck_type: 'Neckline', sleeve_length: 'Sleeve Type', fit: 'Fit' },
      amazon: { fabric: 'material_composition', neck_type: 'neck_style', sleeve_length: 'sleeve_type', fit: 'fit_type' },
    },
    listingsCount: 1,
    status: 'ACTIVE',
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl-102',
    userId: 'owner-uuid-1000-8000-000000000001',
    name: 'Bangles & Jewelry Set',
    marketplace: 'meesho',
    category: 'Jewelry & Accessories',
    subCategory: 'Bangles',
    brand: 'Listivo Craft',
    productType: 'Bangle Set',
    material: 'Brass & Velvet',
    color: 'Red & Gold',
    pattern: 'Stone Studded',
    description: 'Traditional handcrafted velvet glass bangles set for weddings, bridal, and festive occasions.',
    keyFeatures: [
      'Handcrafted velvet finish with durable brass core',
      'Sparkling crystal stone embellishments',
      'Ideal for festive and bridal occasions',
    ],
    gstRate: 3,
    hsnCode: '7117',
    weightGrams: 150,
    lengthCm: 15,
    widthCm: 15,
    heightCm: 6,
    defaultPrice: 299,
    mrp: 699,
    discountPercent: 57,
    returnPolicy: '7 Days Replacement Only',
    careInstructions: 'Keep away from direct water & direct perfume spray',
    skuPrefix: 'JEWEL-BANGL',
    tags: ['bangles', 'bridal', 'velvet', 'jewelry'],
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
    ],
    primaryImageIndex: 0,
    attributes: [
      { id: 'attr-10', key: 'pack_size', label: 'Pack Of', type: 'dropdown', value: '24 Pieces', options: ['12 Pieces', '24 Pieces', '48 Pieces'], isRequired: true, isVariantDefining: false },
      { id: 'attr-11', key: 'finish', label: 'Finish', type: 'dropdown', value: 'Glossy Gold Plated', options: ['Glossy Gold Plated', 'Matte Gold', 'Silver Plated'], isRequired: true, isVariantDefining: false },
    ],
    variantDimensions: [
      { id: 'vdim-3', name: 'Color', options: ['Red', 'Green', 'Maroon'] },
      { id: 'vdim-4', name: 'Size', options: ['2.4', '2.6', '2.8'] },
    ],
    platformMappings: {
      meesho: { pack_size: 'Pack Of', finish: 'Finish' },
      flipkart: { pack_size: 'Quantity', finish: 'Coating' },
    },
    listingsCount: 1,
    status: 'ACTIVE',
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl-103',
    userId: 'owner-uuid-1000-8000-000000000001',
    name: 'Casual Footwear & Sneakers',
    marketplace: 'flipkart',
    category: 'Footwear',
    subCategory: 'Sneakers',
    brand: 'UrbanStep',
    productType: 'Casual Shoes',
    material: 'Synthetic Leather',
    color: 'White',
    pattern: 'Solid',
    description: 'Lightweight unisex casual sneakers with cushioned EVA sole and breathable lining.',
    keyFeatures: [
      'Shock-absorbing EVA memory foam sole',
      'Water-resistant synthetic upper',
      'Non-slip grip outsole',
    ],
    gstRate: 12,
    hsnCode: '6402',
    weightGrams: 650,
    lengthCm: 32,
    widthCm: 20,
    heightCm: 12,
    defaultPrice: 899,
    mrp: 1999,
    discountPercent: 55,
    returnPolicy: '7 Days Returnable',
    careInstructions: 'Wipe with clean dry cloth',
    skuPrefix: 'FOOT-SNKR',
    tags: ['sneakers', 'casual', 'shoes', 'flipkart'],
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    ],
    primaryImageIndex: 0,
    attributes: [
      { id: 'attr-20', key: 'sole_material', label: 'Sole Material', type: 'dropdown', value: 'EVA Rubber', options: ['EVA Rubber', 'TPR', 'PVC', 'Leather'], isRequired: true, isVariantDefining: false },
      { id: 'attr-21', key: 'closure', label: 'Closure', type: 'dropdown', value: 'Lace-Up', options: ['Lace-Up', 'Slip-On', 'Velcro'], isRequired: true, isVariantDefining: false },
      { id: 'attr-22', key: 'toe_shape', label: 'Toe Shape', type: 'dropdown', value: 'Round Toe', options: ['Round Toe', 'Pointed Toe', 'Square Toe'], isRequired: false, isVariantDefining: false },
    ],
    variantDimensions: [
      { id: 'vdim-5', name: 'Color', options: ['White/Red', 'Black', 'Navy Blue'] },
      { id: 'vdim-6', name: 'Size', options: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'] },
    ],
    platformMappings: {
      flipkart: { sole_material: 'Sole Material', closure: 'Closure', toe_shape: 'Toe Shape' },
      meesho: { sole_material: 'Sole', closure: 'Closure Type', toe_shape: 'Toe Type' },
    },
    listingsCount: 0,
    status: 'ACTIVE',
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_PRODUCTS: DBProduct[] = [
  {
    id: 'prod-001',
    userId: 'owner-uuid-1000-8000-000000000001',
    templateId: 'tpl-101',
    templateName: 'Kurtis & Suits Standard',
    title: 'Women Printed Rayon Straight Kurti (Mustard Yellow)',
    sku: 'KURTI-RAYON-YLW-001',
    styleId: 'STYLE-KURTI-101',
    marketplace: 'meesho',
    category: 'Women Ethnic Wear',
    subCategory: 'Kurtis',
    brand: 'StyleCraft',
    material: '100% Pure Rayon',
    description: 'Elegant mustard yellow straight kurti with gold foil printed borders. Breathable rayon fabric with reinforced double stitching, ideal for festive and casual wear.',
    keyFeatures: [
      'Soft and breathable 100% Rayon fabric',
      'Elegant gold foil printed design',
      'Comfortable regular fit for daily wear',
      'Easy wash and color-fast material',
    ],
    mrp: 999,
    sellingPrice: 449,
    costPrice: 220,
    discountPercent: 55,
    stock: 120,
    gstRate: 5,
    hsnCode: '6204',
    weightGrams: 280,
    lengthCm: 28,
    widthCm: 22,
    heightCm: 4,
    returnPolicy: '7 Days Easy Return',
    careInstructions: 'Hand Wash or Machine Wash Cold',
    status: 'READY',
    primaryImageIndex: 0,
    images: [
      { id: 'img-1', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80', isPrimary: true, altText: 'Front View' },
      { id: 'img-2', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80', isPrimary: false, altText: 'Detail View' },
    ],
    attributes: [
      { id: 'attr-1', key: 'fabric', label: 'Fabric', type: 'dropdown', value: 'Rayon', options: ['Rayon', 'Cotton', 'Silk', 'Georgette'], isRequired: true },
      { id: 'attr-2', key: 'neck_type', label: 'Neck Type', type: 'dropdown', value: 'Round Neck', options: ['Round Neck', 'V-Neck', 'Mandarin Collar'], isRequired: true },
      { id: 'attr-3', key: 'sleeve_length', label: 'Sleeve Length', type: 'dropdown', value: 'Three-Quarter Sleeves', options: ['Three-Quarter Sleeves', 'Full Sleeves', 'Short Sleeves'], isRequired: true },
    ],
    variants: [
      { id: 'v-1', sku: 'KURTI-RAYON-YLW-001-S', attributes: { Color: 'Mustard Yellow', Size: 'S' }, price: 449, mrp: 999, stock: 30, costPrice: 220, weightGrams: 280, status: 'ACTIVE' },
      { id: 'v-2', sku: 'KURTI-RAYON-YLW-001-M', attributes: { Color: 'Mustard Yellow', Size: 'M' }, price: 449, mrp: 999, stock: 30, costPrice: 220, weightGrams: 280, status: 'ACTIVE' },
      { id: 'v-3', sku: 'KURTI-RAYON-YLW-001-L', attributes: { Color: 'Mustard Yellow', Size: 'L' }, price: 449, mrp: 999, stock: 30, costPrice: 220, weightGrams: 280, status: 'ACTIVE' },
      { id: 'v-4', sku: 'KURTI-RAYON-YLW-001-XL', attributes: { Color: 'Mustard Yellow', Size: 'XL' }, price: 449, mrp: 999, stock: 30, costPrice: 220, weightGrams: 280, status: 'ACTIVE' },
    ],
    variantsCount: 4,
    platformMappings: {
      meesho: { fabric: 'Fabric', neck_type: 'Neck/Collar', sleeve_length: 'Sleeve Length' },
    },
    validationResults: {
      isValid: true,
      validCount: 12,
      warningCount: 0,
      errorCount: 0,
      issues: [],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-002',
    userId: 'owner-uuid-1000-8000-000000000001',
    templateId: 'tpl-102',
    templateName: 'Bangles & Jewelry Set',
    title: 'Velvet Glass Bangles Chuda Set for Women (Red & Gold)',
    sku: 'JEWEL-BANGL-RED-24P',
    styleId: 'STYLE-JEWEL-202',
    marketplace: 'meesho',
    category: 'Jewelry & Accessories',
    subCategory: 'Bangles',
    brand: 'Listivo Craft',
    material: 'Brass & Velvet',
    description: 'Royal bridal velvet bangle set with stone studded kada. Traditional handcrafted finish.',
    keyFeatures: [
      'Handcrafted velvet finish with durable brass core',
      'Sparkling crystal stone embellishments',
      'Ideal for festive and bridal occasions',
    ],
    mrp: 699,
    sellingPrice: 279,
    costPrice: 120,
    discountPercent: 60,
    stock: 50,
    gstRate: 3,
    hsnCode: '7117',
    weightGrams: 150,
    lengthCm: 15,
    widthCm: 15,
    heightCm: 6,
    returnPolicy: '7 Days Replacement Only',
    careInstructions: 'Keep away from direct water & perfume spray',
    status: 'DRAFT',
    primaryImageIndex: 0,
    images: [
      { id: 'img-3', url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80', isPrimary: true, altText: 'Bangles Set' },
    ],
    attributes: [
      { id: 'attr-10', key: 'pack_size', label: 'Pack Of', type: 'dropdown', value: '24 Pieces', options: ['12 Pieces', '24 Pieces', '48 Pieces'], isRequired: true },
      { id: 'attr-11', key: 'finish', label: 'Finish', type: 'dropdown', value: 'Glossy Gold Plated', options: ['Glossy Gold Plated', 'Matte Gold'], isRequired: true },
    ],
    variants: [
      { id: 'v-5', sku: 'JEWEL-BANGL-RED-2.4', attributes: { Size: '2.4' }, price: 279, mrp: 699, stock: 15, costPrice: 120, weightGrams: 150, status: 'ACTIVE' },
      { id: 'v-6', sku: 'JEWEL-BANGL-RED-2.6', attributes: { Size: '2.6' }, price: 279, mrp: 699, stock: 20, costPrice: 120, weightGrams: 150, status: 'ACTIVE' },
      { id: 'v-7', sku: 'JEWEL-BANGL-RED-2.8', attributes: { Size: '2.8' }, price: 279, mrp: 699, stock: 15, costPrice: 120, weightGrams: 150, status: 'ACTIVE' },
    ],
    variantsCount: 3,
    platformMappings: {
      meesho: { pack_size: 'Pack Of', finish: 'Finish' },
    },
    validationResults: {
      isValid: true,
      validCount: 10,
      warningCount: 1,
      errorCount: 0,
      issues: [
        { field: 'images', section: 'Images', severity: 'warning', message: 'Adding at least 2 images increases customer conversion.' },
      ],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_ACTIVITIES: DBActivity[] = [
  {
    id: 'act-1',
    userId: 'owner-uuid-1000-8000-000000000001',
    activityType: 'template_created',
    title: 'Created Template: Kurtis & Suits Standard',
    description: 'Configured GST 5%, Meesho Category "Women Ethnic Wear", Rayon attributes.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'act-2',
    userId: 'owner-uuid-1000-8000-000000000001',
    activityType: 'extension_autofill',
    title: 'Chrome Extension Handshake Verified',
    description: 'Listivo Companion Extension initialized on Meesho Seller Panel.',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const INITIAL_BULK_IMPORTS: DBBulkImport[] = [
  {
    id: 'import-101',
    userId: 'owner-uuid-1000-8000-000000000001',
    fileName: 'Meesho_Kurtis_Catalog_Batch1.csv',
    fileSize: 48520,
    marketplace: 'meesho',
    templateId: 'tpl-101',
    templateName: 'Kurtis & Suits Standard',
    totalRows: 25,
    validRows: 22,
    warningRows: 2,
    errorRows: 1,
    importedRows: 22,
    skippedRows: 1,
    status: 'COMPLETED_WITH_WARNINGS',
    durationMs: 420,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'import-102',
    userId: 'owner-uuid-1000-8000-000000000001',
    fileName: 'Bangles_Jewelry_Collection_v2.xlsx',
    fileSize: 112400,
    marketplace: 'meesho',
    templateId: 'tpl-102',
    templateName: 'Bangles & Jewelry Set',
    totalRows: 50,
    validRows: 50,
    warningRows: 0,
    errorRows: 0,
    importedRows: 50,
    skippedRows: 0,
    status: 'COMPLETED',
    durationMs: 890,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export const INITIAL_MAPPING_PRESETS: DBColumnMappingPreset[] = [
  {
    id: 'preset-meesho-standard',
    userId: 'owner-uuid-1000-8000-000000000001',
    name: 'Meesho Standard Seller CSV',
    marketplace: 'meesho',
    mappings: {
      'Product Title': 'title',
      'SKU ID': 'sku',
      'Style Code': 'styleId',
      'Brand': 'brand',
      'Category Name': 'category',
      'Fabric Material': 'material',
      'Selling Price (INR)': 'sellingPrice',
      'MRP (INR)': 'mrp',
      'GST Percentage': 'gstRate',
      'HSN Code': 'hsnCode',
      'Weight (Grams)': 'weightGrams',
      'Main Image URL': 'imageUrl1',
      'Sub Image URL 1': 'imageUrl2',
      'Product Description': 'description',
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'preset-flipkart-standard',
    userId: 'owner-uuid-1000-8000-000000000001',
    name: 'Flipkart Listing Template',
    marketplace: 'flipkart',
    mappings: {
      'Title': 'title',
      'Seller SKU': 'sku',
      'Price': 'sellingPrice',
      'MRP': 'mrp',
      'Stock': 'stock',
      'HSN': 'hsnCode',
      'GST': 'gstRate',
      'Image 1': 'imageUrl1',
    },
    createdAt: new Date().toISOString(),
  },
];

export interface DBKeywordItem {
  id: string;
  keyword: string;
  category: 'PRIMARY' | 'SECONDARY' | 'LONG-TAIL' | 'ATTRIBUTE' | 'BUYING-INTENT' | 'SEASONAL';
  relevanceScore: number;
  suggestedUsage: string;
  confidenceLabel: 'HIGH' | 'MEDIUM' | 'LOW';
  intent: 'HIGH' | 'MEDIUM' | 'LOW';
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: 'active' | 'saved' | 'ignored';
}

export interface DBKeywordSet {
  id: string;
  userId: string;
  name: string;
  marketplace: string;
  category: string;
  keywords: DBKeywordItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_KEYWORD_SETS: DBKeywordSet[] = [
  {
    id: 'kwset-001',
    userId: 'owner-uuid-1000-8000-000000000001',
    name: 'Red Rayon Kurti SEO Keywords',
    marketplace: 'meesho',
    category: 'Ethnic Wear',
    keywords: [
      {
        id: 'kw-1',
        keyword: 'rayon kurti for women',
        category: 'PRIMARY',
        relevanceScore: 96,
        suggestedUsage: 'Title & Top Product Bullet',
        confidenceLabel: 'HIGH',
        intent: 'HIGH',
        risk: 'LOW',
        status: 'active',
      },
      {
        id: 'kw-2',
        keyword: 'printed straight kurti under 400',
        category: 'LONG-TAIL',
        relevanceScore: 92,
        suggestedUsage: 'First 200 chars of Description',
        confidenceLabel: 'HIGH',
        intent: 'HIGH',
        risk: 'LOW',
        status: 'active',
      },
      {
        id: 'kw-3',
        keyword: 'festive wear ethnic kurti set',
        category: 'SEASONAL',
        relevanceScore: 88,
        suggestedUsage: 'Bullet Points & Search Tags',
        confidenceLabel: 'MEDIUM',
        intent: 'HIGH',
        risk: 'LOW',
        status: 'active',
      },
      {
        id: 'kw-4',
        keyword: 'soft pure rayon daily wear kurti',
        category: 'ATTRIBUTE',
        relevanceScore: 90,
        suggestedUsage: 'Fabric & Material Description',
        confidenceLabel: 'HIGH',
        intent: 'MEDIUM',
        risk: 'LOW',
        status: 'active',
      },
      {
        id: 'kw-5',
        keyword: 'meesho top seller women kurti',
        category: 'BUYING-INTENT',
        relevanceScore: 85,
        suggestedUsage: 'Product Search Keywords',
        confidenceLabel: 'MEDIUM',
        intent: 'HIGH',
        risk: 'LOW',
        status: 'active',
      },
    ],
    notes: 'Primary keyword cluster for high-converting Meesho Women Kurti catalog listings.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_PRICING_RULES: DBPricingRule[] = [
  {
    id: 'rule-101',
    userId: 'owner-uuid-1000-8000-000000000001',
    name: 'Standard Kurti Pricing',
    gstRate: 5,
    packagingCost: 15,
    shippingCost: 65,
    marketplaceFee: 10,
    marketplaceFeePercent: 12,
    targetMargin: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule-102',
    userId: 'owner-uuid-1000-8000-000000000001',
    name: 'Bangles & Jewelry Sets',
    gstRate: 3,
    packagingCost: 20,
    shippingCost: 50,
    marketplaceFee: 5,
    marketplaceFeePercent: 15,
    targetMargin: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
