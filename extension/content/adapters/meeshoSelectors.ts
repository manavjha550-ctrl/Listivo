/**
 * Centralized DOM selector definitions and fallback lookup strategies for Meesho Supplier Portal.
 * Abstracts fragile class names and provides multi-tier resilient fallback matching.
 */

export interface FieldSelectorConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'custom_dropdown' | 'file';
  primarySelectors: string[];
  fallbackSelectors: string[];
  placeholderRegex?: RegExp;
  labelRegex?: RegExp;
  supported: boolean;
  manualConfirmation?: boolean;
}

export const MEESHO_PAGE_SELECTORS = {
  loginPageIndicators: [
    'input[type="tel"]',
    'input[name="phone"]',
    'input[placeholder*="mobile" i]',
    'input[placeholder*="phone" i]',
    'div[class*="login" i]',
    'form[action*="login" i]',
  ],
  dashboardIndicators: [
    'div[class*="analytics" i]',
    'div[class*="dashboard" i]',
    'a[href*="orders" i]',
    'div[class*="metrics" i]',
  ],
  catalogPageIndicators: [
    'a[href*="catalog" i]',
    'div[class*="catalog-list" i]',
    'button[class*="add-catalog" i]',
    'button[data-testid*="add-catalog" i]',
  ],
  loginIndicators: [
    'div[class*="supplier" i]',
    'div[class*="sidebar" i]',
    'a[href*="orders" i]',
    'a[href*="catalog" i]',
    'button[class*="profile" i]',
    'div[class*="user-profile" i]',
    'div[class*="account" i]',
  ],
  listingFormIndicators: [
    'input[name*="title" i]',
    'input[name*="product" i]',
    'input[placeholder*="title" i]',
    'input[placeholder*="product" i]',
    'input[name="sellingPrice"]',
    'input[name="supplierPrice"]',
    'input[name="sku"]',
    'input[placeholder*="SKU" i]',
    'div[class*="single-upload" i]',
    'div[class*="add-product" i]',
    'div[data-testid*="catalog" i]',
    'div[class*="catalog-form" i]',
  ],
};

export const MEESHO_FIELD_SELECTORS: Record<string, FieldSelectorConfig> = {
  title: {
    key: 'title',
    label: 'Product Title / Name',
    type: 'text',
    primarySelectors: [
      'input[name="title"]',
      'input[name="productName"]',
      'input[name="product_name"]',
      'input[aria-label*="title" i]',
      'input[aria-label*="product name" i]',
    ],
    fallbackSelectors: [
      'input[placeholder*="Product Name" i]',
      'input[placeholder*="Title" i]',
      'input[placeholder*="Enter product title" i]',
      'input[id*="title" i]',
      'input[id*="productName" i]',
    ],
    placeholderRegex: /product\s*name|title|product\s*title/i,
    labelRegex: /product\s*name|title/i,
    supported: true,
  },
  description: {
    key: 'description',
    label: 'Product Description',
    type: 'textarea',
    primarySelectors: [
      'textarea[name="description"]',
      'textarea[id*="description" i]',
      'textarea[aria-label*="description" i]',
    ],
    fallbackSelectors: [
      'textarea[placeholder*="description" i]',
      'textarea[placeholder*="product details" i]',
      'div[contenteditable="true"][placeholder*="description" i]',
      'textarea',
    ],
    placeholderRegex: /description|details|about\s*the\s*product/i,
    labelRegex: /description|product\s*details/i,
    supported: true,
  },
  brand: {
    key: 'brand',
    label: 'Brand Name',
    type: 'text',
    primarySelectors: [
      'input[name="brand"]',
      'input[id*="brand" i]',
      'input[aria-label*="brand" i]',
    ],
    fallbackSelectors: [
      'input[placeholder*="brand" i]',
      'select[name="brand"]',
    ],
    placeholderRegex: /brand/i,
    labelRegex: /brand/i,
    supported: true,
  },
  category: {
    key: 'category',
    label: 'Product Category',
    type: 'custom_dropdown',
    primarySelectors: [
      'select[name="category"]',
      'input[name="category"]',
      'div[id*="category" i]',
    ],
    fallbackSelectors: [
      'input[placeholder*="category" i]',
      'div[class*="category" i] select',
    ],
    placeholderRegex: /category/i,
    labelRegex: /category/i,
    supported: true,
  },
  material: {
    key: 'material',
    label: 'Fabric / Material',
    type: 'text',
    primarySelectors: [
      'input[name="material"]',
      'input[name="fabric"]',
      'select[name="material"]',
      'select[name="fabric"]',
    ],
    fallbackSelectors: [
      'input[placeholder*="material" i]',
      'input[placeholder*="fabric" i]',
      'input[id*="material" i]',
      'input[id*="fabric" i]',
    ],
    placeholderRegex: /material|fabric/i,
    labelRegex: /material|fabric/i,
    supported: true,
  },
  color: {
    key: 'color',
    label: 'Primary Color',
    type: 'text',
    primarySelectors: [
      'input[name="color"]',
      'select[name="color"]',
    ],
    fallbackSelectors: [
      'input[placeholder*="color" i]',
      'input[id*="color" i]',
    ],
    placeholderRegex: /color/i,
    labelRegex: /color/i,
    supported: true,
  },
  size: {
    key: 'size',
    label: 'Size / Variants',
    type: 'text',
    primarySelectors: [
      'input[name="size"]',
      'select[name="size"]',
    ],
    fallbackSelectors: [
      'input[placeholder*="size" i]',
      'input[id*="size" i]',
      'div[class*="size" i] input',
    ],
    placeholderRegex: /size/i,
    labelRegex: /size/i,
    supported: true,
  },
  sku: {
    key: 'sku',
    label: 'Style ID / SKU',
    type: 'text',
    primarySelectors: [
      'input[name="sku"]',
      'input[name="styleId"]',
      'input[name="style_id"]',
    ],
    fallbackSelectors: [
      'input[placeholder*="SKU" i]',
      'input[placeholder*="Style ID" i]',
      'input[id*="sku" i]',
      'input[id*="styleId" i]',
    ],
    placeholderRegex: /sku|style\s*id|supplier\s*sku/i,
    labelRegex: /sku|style\s*id/i,
    supported: true,
  },
  sellingPrice: {
    key: 'sellingPrice',
    label: 'Price to Supplier (Selling Price)',
    type: 'text',
    primarySelectors: [
      'input[name="sellingPrice"]',
      'input[name="supplierPrice"]',
      'input[name="price"]',
    ],
    fallbackSelectors: [
      'input[placeholder*="Selling Price" i]',
      'input[placeholder*="Price" i]',
      'input[id*="sellingPrice" i]',
      'input[id*="price" i]',
    ],
    placeholderRegex: /selling\s*price|price|price\s*to\s*supplier/i,
    labelRegex: /selling\s*price|price/i,
    supported: true,
  },
  meeshoPrice: {
    key: 'meeshoPrice',
    label: 'Meesho Supplier Price',
    type: 'text',
    primarySelectors: [
      'input[name="meeshoPrice"]',
      'input[name="sellingPrice"]',
      'input[name="supplierPrice"]',
      'input[aria-label*="meesho price" i]',
    ],
    fallbackSelectors: [
      'input[placeholder*="Meesho Price" i]',
      'input[placeholder*="Selling Price" i]',
      'input[id*="meeshoPrice" i]',
      'input[id*="sellingPrice" i]',
    ],
    placeholderRegex: /meesho\s*price|selling\s*price/i,
    labelRegex: /meesho\s*price/i,
    supported: true,
  },
  wrongComboPrice: {
    key: 'wrongComboPrice',
    label: 'Wrong / Defective Return Price',
    type: 'text',
    primarySelectors: [
      'input[name="wrongComboPrice"]',
      'input[name="wrongReturnPrice"]',
      'input[aria-label*="wrong" i]',
    ],
    fallbackSelectors: [
      'input[placeholder*="wrong" i]',
      'input[placeholder*="defective" i]',
    ],
    placeholderRegex: /wrong|defective/i,
    labelRegex: /wrong.*price/i,
    supported: true,
  },
  mrp: {
    key: 'mrp',
    label: 'Maximum Retail Price (MRP)',
    type: 'text',
    primarySelectors: [
      'input[name="mrp"]',
      'input[id*="mrp" i]',
    ],
    fallbackSelectors: [
      'input[placeholder*="MRP" i]',
      'input[placeholder*="Maximum Retail Price" i]',
    ],
    placeholderRegex: /mrp|maximum\s*retail\s*price/i,
    labelRegex: /mrp/i,
    supported: true,
  },
  gstRate: {
    key: 'gstRate',
    label: 'GST Percentage',
    type: 'select',
    primarySelectors: [
      'select[name="gst"]',
      'select[name="gstRate"]',
    ],
    fallbackSelectors: [
      'input[name="gst"]',
      'select[placeholder*="GST" i]',
      'input[placeholder*="GST" i]',
      'input[id*="gst" i]',
    ],
    placeholderRegex: /gst|gst\s*rate|gst\s*%/i,
    labelRegex: /gst/i,
    supported: true,
  },
  gstPercentage: {
    key: 'gstPercentage',
    label: 'GST Percentage Rate',
    type: 'select',
    primarySelectors: [
      'select[name="gst"]',
      'select[name="gstRate"]',
      'input[name="gstPercentage"]',
    ],
    fallbackSelectors: [
      'input[name="gst"]',
      'select[placeholder*="GST" i]',
      'input[placeholder*="GST" i]',
    ],
    placeholderRegex: /gst/i,
    labelRegex: /gst/i,
    supported: true,
  },
  hsnCode: {
    key: 'hsnCode',
    label: 'HSN Code',
    type: 'text',
    primarySelectors: [
      'input[name="hsn"]',
      'input[name="hsnCode"]',
    ],
    fallbackSelectors: [
      'input[placeholder*="HSN" i]',
      'input[id*="hsn" i]',
    ],
    placeholderRegex: /hsn|hsn\s*code/i,
    labelRegex: /hsn/i,
    supported: true,
  },
  weightGrams: {
    key: 'weightGrams',
    label: 'Package Weight (Grams)',
    type: 'text',
    primarySelectors: [
      'input[name="weight"]',
      'input[id*="weight" i]',
    ],
    fallbackSelectors: [
      'input[placeholder*="weight" i]',
    ],
    placeholderRegex: /weight/i,
    labelRegex: /weight/i,
    supported: true,
  },
  countryOfOrigin: {
    key: 'countryOfOrigin',
    label: 'Country of Origin',
    type: 'text',
    primarySelectors: [
      'input[name="countryOfOrigin"]',
      'select[name="countryOfOrigin"]',
      'input[name="origin"]',
    ],
    fallbackSelectors: [
      'input[placeholder*="country" i]',
      'select[placeholder*="country" i]',
      'input[id*="country" i]',
    ],
    placeholderRegex: /country\s*of\s*origin|country/i,
    labelRegex: /country\s*of\s*origin|origin/i,
    supported: true,
  },
  manufacturer: {
    key: 'manufacturer',
    label: 'Manufacturer / Packer Details',
    type: 'text',
    primarySelectors: [
      'input[name="manufacturer"]',
      'textarea[name="manufacturer"]',
      'input[name="packer"]',
    ],
    fallbackSelectors: [
      'input[placeholder*="manufacturer" i]',
      'textarea[placeholder*="manufacturer" i]',
      'input[id*="manufacturer" i]',
    ],
    placeholderRegex: /manufacturer|packer/i,
    labelRegex: /manufacturer|packer/i,
    supported: true,
  },
  images: {
    key: 'images',
    label: 'Product Images Upload',
    type: 'file',
    primarySelectors: [
      'input[type="file"][accept*="image"]',
      'input[type="file"]',
    ],
    fallbackSelectors: [
      'div[class*="image-upload" i]',
      'div[class*="upload-box" i]',
    ],
    supported: true,
    manualConfirmation: true, // Requires native browser file picker approval
  },
};
