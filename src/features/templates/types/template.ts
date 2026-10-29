export type AttributeFieldType =
  | 'text'
  | 'number'
  | 'dropdown'
  | 'multiselect'
  | 'boolean'
  | 'date'
  | 'url';

export interface TemplateAttribute {
  id: string;
  key: string;
  label: string;
  type: AttributeFieldType;
  value: any;
  options?: string[];
  isRequired: boolean;
  isVariantDefining?: boolean;
}

export interface VariantDimension {
  id: string;
  name: string; // e.g., Color, Size
  options: string[]; // e.g., ['Red', 'Blue'], ['S', 'M', 'L']
}

export interface GeneratedVariantCombo {
  id: string;
  sku: string;
  attributes: Record<string, string>; // e.g. { Color: 'Red', Size: 'S' }
  price?: number;
  stock?: number;
}

export interface PlatformMapping {
  meesho: Record<string, string>;
  flipkart: Record<string, string>;
  amazon?: Record<string, string>;
  myntra?: Record<string, string>;
}

export interface ListingTemplate {
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
  attributes: TemplateAttribute[];
  variantDimensions?: VariantDimension[];
  platformMappings?: PlatformMapping;
  listingsCount?: number;
  status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateFilterParams {
  search?: string;
  category?: string;
  platform?: string;
  sort?: 'updated' | 'name' | 'category';
}

export const CATEGORY_PRESETS: Record<string, { subCategories: string[]; defaultAttributes: Omit<TemplateAttribute, 'id'>[] }> = {
  Apparel: {
    subCategories: ['Kurtis', 'Sarees', 'T-Shirts', 'Shirts', 'Ethnic Wear', 'Dresses', 'Jeans & Trousers'],
    defaultAttributes: [
      { key: 'fabric', label: 'Fabric / Material', type: 'dropdown', value: 'Cotton', options: ['Cotton', 'Rayon', 'Silk', 'Georgette', 'Polyester', 'Linen'], isRequired: true, isVariantDefining: false },
      { key: 'neck_type', label: 'Neck Type', type: 'dropdown', value: 'Round Neck', options: ['Round Neck', 'V-Neck', 'Mandarin Collar', 'Boat Neck', 'Collar'], isRequired: true, isVariantDefining: false },
      { key: 'sleeve_length', label: 'Sleeve Length', type: 'dropdown', value: 'Three-Quarter Sleeves', options: ['Three-Quarter Sleeves', 'Full Sleeves', 'Short Sleeves', 'Sleeveless'], isRequired: true, isVariantDefining: false },
      { key: 'fit', label: 'Fit Type', type: 'dropdown', value: 'Regular Fit', options: ['Regular Fit', 'Slim Fit', 'Loose / Oversized', 'Straight'], isRequired: true, isVariantDefining: false },
      { key: 'pattern', label: 'Pattern', type: 'dropdown', value: 'Printed', options: ['Printed', 'Solid', 'Embroidered', 'Self Design', 'Striped'], isRequired: false, isVariantDefining: false },
    ],
  },
  Footwear: {
    subCategories: ['Sneakers', 'Casual Shoes', 'Formal Shoes', 'Sandals & Floaters', 'Heels', 'Flats & Juttis'],
    defaultAttributes: [
      { key: 'sole_material', label: 'Sole Material', type: 'dropdown', value: 'EVA Rubber', options: ['EVA Rubber', 'TPR', 'PVC', 'Leather', 'Rubber'], isRequired: true, isVariantDefining: false },
      { key: 'closure', label: 'Closure', type: 'dropdown', value: 'Lace-Up', options: ['Lace-Up', 'Slip-On', 'Velcro', 'Buckle'], isRequired: true, isVariantDefining: false },
      { key: 'toe_shape', label: 'Toe Shape', type: 'dropdown', value: 'Round Toe', options: ['Round Toe', 'Pointed Toe', 'Square Toe'], isRequired: false, isVariantDefining: false },
      { key: 'upper_material', label: 'Upper Material', type: 'dropdown', value: 'Synthetic Leather', options: ['Synthetic Leather', 'Canvas', 'Mesh', 'Genuine Leather'], isRequired: true, isVariantDefining: false },
    ],
  },
  'Jewelry & Accessories': {
    subCategories: ['Bangles', 'Necklaces', 'Earrings', 'Watches', 'Handbags & Clutches', 'Sunglasses'],
    defaultAttributes: [
      { key: 'pack_size', label: 'Pack Of', type: 'dropdown', value: '24 Pieces', options: ['1 Piece', '2 Pieces', '12 Pieces', '24 Pieces', '48 Pieces'], isRequired: true, isVariantDefining: false },
      { key: 'finish', label: 'Plating / Finish', type: 'dropdown', value: 'Glossy Gold Plated', options: ['Glossy Gold Plated', 'Matte Gold', 'Silver Plated', 'Rose Gold', 'Antiqued'], isRequired: true, isVariantDefining: false },
      { key: 'base_metal', label: 'Base Metal', type: 'dropdown', value: 'Brass', options: ['Brass', 'Alloy', 'Copper', 'Glass', 'Stainless Steel'], isRequired: true, isVariantDefining: false },
    ],
  },
  'Home & Kitchen': {
    subCategories: ['Bedsheets', 'Curtains', 'Cookware', 'Storage Containers', 'Wall Decor', 'Towels'],
    defaultAttributes: [
      { key: 'material', label: 'Material', type: 'dropdown', value: 'Microfiber', options: ['Microfiber', '100% Cotton', 'Stainless Steel', 'Plastic', 'Ceramic'], isRequired: true, isVariantDefining: false },
      { key: 'shape', label: 'Shape / Type', type: 'dropdown', value: 'Rectangular', options: ['Rectangular', 'Square', 'Round', 'Oval'], isRequired: false, isVariantDefining: false },
      { key: 'care_instruction', label: 'Care Instruction', type: 'text', value: 'Machine wash in cold water', isRequired: false, isVariantDefining: false },
    ],
  },
  Beauty: {
    subCategories: ['Skincare', 'Haircare', 'Makeup', 'Fragrance', 'Grooming Tools'],
    defaultAttributes: [
      { key: 'skin_type', label: 'Skin Type', type: 'dropdown', value: 'All Skin Types', options: ['All Skin Types', 'Oily', 'Dry', 'Sensitive', 'Combination'], isRequired: true, isVariantDefining: false },
      { key: 'organic_type', label: 'Organic / Vegan', type: 'boolean', value: true, isRequired: false, isVariantDefining: false },
      { key: 'expiry_period_months', label: 'Shelf Life (Months)', type: 'number', value: 24, isRequired: true, isVariantDefining: false },
    ],
  },
};
