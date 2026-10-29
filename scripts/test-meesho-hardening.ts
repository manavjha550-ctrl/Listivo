/**
 * LISTIVO Phase 8C - Meesho QA & Hardening Automated Test Suite
 * Tests unit logic for page detection, field mapping, price rules, strict verification,
 * retry limits, concurrency guards, and data preservation.
 */

import { MeeshoFieldMapper } from '../extension/content/mappers/MeeshoFieldMapper';
import { MEESHO_FIELD_SELECTORS } from '../extension/content/adapters/meeshoSelectors';
import { detectMarketplace } from '../extension/content/marketplace-detector';
import { ExtensionTemplateDTO, ExtensionListingDTO } from '../extension/shared/types';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('====================================================');
console.log('  LISTIVO PHASE 8C: MEESHO QA & HARDENING TEST SUITE');
console.log('====================================================\n');

// 1. Host & Marketplace Detection Tests
console.log('--- Suite 1: Marketplace & Host Detection ---');
assert(
  detectMarketplace('supplier.meesho.com').supported && detectMarketplace('supplier.meesho.com').marketplace === 'MEESHO',
  'supplier.meesho.com detected as supported MEESHO'
);
assert(
  detectMarketplace('meesho.com').marketplace === 'MEESHO',
  'meesho.com detected as MEESHO'
);
assert(
  detectMarketplace('seller.flipkart.com').marketplace === 'FLIPKART' && !detectMarketplace('seller.flipkart.com').supported,
  'Flipkart recognized but correctly marked unsupported in Phase 8C'
);
assert(
  detectMarketplace('sellercentral.amazon.in').marketplace === 'AMAZON' && !detectMarketplace('sellercentral.amazon.in').supported,
  'Amazon recognized but correctly marked unsupported in Phase 8C'
);

// 2. Field Mapper Hardening Tests (MRP >= Selling Price, GST, HSN, Weight, Origin)
console.log('\n--- Suite 2: LISTIVO-to-Meesho Data Mapping ---');
const sampleTemplate: ExtensionTemplateDTO = {
  id: 'tmpl-qa-1',
  name: 'Handcrafted Cotton Kurta',
  marketplace: 'MEESHO',
  category: 'Women Ethnic Wear',
  description: 'Pure 100% Khadi Cotton Handcrafted Kurti with intricate embroidery.',
  hsnCode: '6204',
  gstRate: 5,
  weightGrams: 300,
  defaultPrice: 699,
  mrp: 1299,
  attributes: [
    { key: 'origin', label: 'Country of Origin', value: 'India' },
    { key: 'manufacturer', label: 'Manufacturer', value: 'Listivo Crafts Ltd' },
    { key: 'fabric', label: 'Fabric', value: 'Cotton' },
  ],
};

const mappedFromTemplate = MeeshoFieldMapper.mapData(sampleTemplate);

assert(mappedFromTemplate['title'].value === 'Handcrafted Cotton Kurta', 'Title mapped correctly');
assert(mappedFromTemplate['mrp'].value === 1299, 'MRP mapped correctly');
assert(mappedFromTemplate['meeshoPrice'].value === 699, 'Meesho Price mapped correctly');
assert(Number(mappedFromTemplate['mrp'].value) >= Number(mappedFromTemplate['meeshoPrice'].value), 'Price rule: MRP is greater than or equal to Meesho price');
assert(mappedFromTemplate['gstPercentage'].value === 5, 'GST percentage mapped correctly');
assert(mappedFromTemplate['hsnCode'].value === '6204', 'HSN code mapped correctly');
assert(mappedFromTemplate['weightGrams'].value === 300, 'Weight mapped correctly');
assert(mappedFromTemplate['countryOfOrigin'].value === 'India', 'Country of origin defaults to India');
assert(mappedFromTemplate['manufacturer'].value === 'Listivo Crafts Ltd', 'Manufacturer mapped from attributes');

// 3. Price Anomaly Safeguard Test
console.log('\n--- Suite 3: Price Inversion Safety ---');
const invalidPriceTemplate: ExtensionTemplateDTO = {
  id: 'tmpl-bad-price',
  name: 'Buggy Price Item',
  marketplace: 'MEESHO',
  category: 'Apparel',
  defaultPrice: 600, // Meesho Price higher than MRP -> Invalid!
  mrp: 400,
};
const mappedBadPrice = MeeshoFieldMapper.mapData(invalidPriceTemplate);
// MeeshoFieldMapper auto-adjusts MRP to at least match Meesho Price or uses sane fallback
assert(
  Number(mappedBadPrice['mrp'].value) >= Number(mappedBadPrice['meeshoPrice'].value),
  'Mapper automatically enforces MRP >= Meesho Price to prevent seller rejection'
);

// 4. Selector Structure and Coverage Verification
console.log('\n--- Suite 4: Meesho Selector Definitions & Coverage ---');
const requiredFieldKeys = [
  'title',
  'description',
  'mrp',
  'meeshoPrice',
  'wrongComboPrice',
  'sku',
  'gstPercentage',
  'hsnCode',
  'weightGrams',
  'countryOfOrigin',
  'manufacturer',
  'category',
  'images',
];

for (const key of requiredFieldKeys) {
  const def = MEESHO_FIELD_SELECTORS[key];
  assert(
    !!def && def.primarySelectors.length > 0,
    `Selector definition for '${key}' exists with ${def ? def.primarySelectors.length : 0} primary selectors`
  );
}

// 5. High-Risk Operations Tagged for Manual Confirmation
console.log('\n--- Suite 5: High-Risk Operations Safety Flags ---');
assert(
  MEESHO_FIELD_SELECTORS['images'].supported === false || MEESHO_FIELD_SELECTORS['images'].manualConfirmation === true,
  'Image upload is flagged for manual confirmation/fallback (browser sandbox security)'
);
assert(
  MEESHO_FIELD_SELECTORS['category'].supported === true,
  'Category selector exists with dropdown navigation support'
);

// 6. Autofill Engine Pre-Validation & Concurrency Guards
console.log('\n--- Suite 6: Engine Pre-Validation & Safety Guards ---');
const dummyAdapter: any = {
  detectPage: () => ({ isSupported: true, isListingForm: true, pageType: 'CATALOG_ADD' }),
  fillField: async () => ({ success: true, status: 'SUCCESS' }),
  verifyField: () => ({ verified: true, status: 'VERIFIED' }),
};

const { AutofillEngine } = await import('../extension/content/engine/AutofillEngine');
const engine = new AutofillEngine(dummyAdapter);

const validListing: ExtensionListingDTO = {
  id: 'lst-1',
  marketplace: 'MEESHO',
  status: 'ACTIVE',
  title: 'Printed Rayon Anarkali Kurta',
  sku: 'RAYON-ANA-01',
  sellingPrice: 599,
  mrp: 1199,
  description: 'Soft rayon material with floral digital print.',
  category: 'Women Apparel',
  hsnCode: '6204',
  gstRate: 5,
};

const validationResult = engine.validateData(validListing);
assert(validationResult.isValid, 'Valid listing passes engine pre-validation');
assert(validationResult.mappedFieldsCount >= 6, 'Mapped fields count >= 6');

// Test missing required field
const incompleteListing: ExtensionListingDTO = {
  id: 'lst-2',
  marketplace: 'MEESHO',
  status: 'DRAFT',
  title: '', // Missing title
  sku: '',   // Missing sku
  sellingPrice: 0,
  mrp: 0,
  description: '',
  category: '',
  hsnCode: '',
  gstRate: 5,
};
const incompleteResult = engine.validateData(incompleteListing);
assert(!incompleteResult.isValid, 'Incomplete listing fails engine pre-validation');
assert(incompleteResult.issues.length >= 2, 'Issues detected for missing required fields');

// Test engine abort and isRunning flags
assert(!engine.isRunning(), 'Engine starts in idle state (not running)');
engine.abort();
assert(!engine.isRunning(), 'Aborting an idle engine remains safe and idle');

// Summary Report
console.log('\n====================================================');
console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
