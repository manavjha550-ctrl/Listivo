/**
 * Reusable Prompt System for Listivo AI Assistant
 * Standardized prompts for Indian Marketplace E-commerce Listings
 */

export interface PromptContext {
  title?: string;
  brand?: string;
  category?: string;
  subCategory?: string;
  material?: string;
  color?: string;
  pattern?: string;
  marketplace?: string; // meesho, flipkart, amazon
  price?: number;
  mrp?: number;
  attributes?: Record<string, any> | Array<{ key: string; label: string; value: any }>;
  keyFeatures?: string[];
  rawText?: string;
  tone?: 'professional' | 'seo' | 'festive' | 'concise';
  customInstructions?: string;
}

const COMMON_SAFETY_INSTRUCTIONS = `
CRITICAL COMPLIANCE & SAFETY RULES:
1. DO NOT fabricate or invent factual claims (e.g. non-existent certifications, "100% Organic", "ISRO approved", fake warranties unless provided).
2. DO NOT make false or exaggerated claims that could trigger marketplace rejections.
3. DO NOT claim official approval or endorsement by Meesho, Flipkart, or Amazon.
4. Output MUST be clean, valid JSON only without markdown enclosing backticks.
`;

export function getTitlePrompt(ctx: PromptContext): string {
  const marketplace = (ctx.marketplace || 'meesho').toLowerCase();
  
  let platformGuide = '';
  if (marketplace === 'meesho') {
    platformGuide = 'Format: [Brand] [Product Type/Subcategory] [Key Design/Pattern] [Color/Pack Size]. Keep it under 80 characters, concise and high conversion for Indian resellers.';
  } else if (marketplace === 'flipkart') {
    platformGuide = 'Format: [Brand] [Product Title] ([Color], [Pack of X], [Key Material/Feature]). SEO-dense for Flipkart search algorithms, 80-120 characters.';
  } else if (marketplace === 'amazon') {
    platformGuide = 'Format: [Brand] [Product Name] [Material/Fabric] [Key Feature] [Color/Size] [Model/Type]. Complete specification title up to 150 characters.';
  } else {
    platformGuide = 'Format: [Brand] [Product Name] [Key Specs] [Color/Pack Size]. High-converting e-commerce title.';
  }

  return `You are an expert e-commerce catalog specialist for Indian marketplaces (Meesho, Flipkart, Amazon).
Generate 3 distinct, high-converting product title options based on these details:
- Raw Input / Name: ${ctx.title || ctx.rawText || 'Product'}
- Brand: ${ctx.brand || 'Generic'}
- Category: ${ctx.category || 'General'}
- SubCategory: ${ctx.subCategory || ''}
- Material: ${ctx.material || ''}
- Color/Pattern: ${ctx.color || ''} ${ctx.pattern || ''}
- Target Marketplace: ${marketplace.toUpperCase()}
- Platform Guide: ${platformGuide}

${COMMON_SAFETY_INSTRUCTIONS}

Respond ONLY in valid JSON format with keys:
{
  "recommendedTitle": "The single best title following target marketplace guidelines",
  "alternativeTitles": [
    "Alternative Title Option 1 (SEO Focused)",
    "Alternative Title Option 2 (Concise Mobile-first)"
  ],
  "reasoning": "Brief 1-sentence explanation of why the recommended title works best for ${marketplace.toUpperCase()}."
}`;
}

export function getDescriptionPrompt(ctx: PromptContext): string {
  const toneMap = {
    professional: 'Formal, precise, clear, and high-trust e-commerce tone.',
    seo: 'Search-optimized with natural high-intent buyer terms, structured sections, and clear features.',
    festive: 'Vibrant, festive, celebratory tone tailored for Diwali, Eid, Puja, Weddings, and Indian gifting occasions.',
    concise: 'Tight, punchy, mobile-friendly bullet-driven summary under 90 words.',
  };

  const selectedTone = toneMap[ctx.tone || 'professional'];

  return `You are an expert e-commerce copywriter for Indian marketplace sellers.
Generate a product description and key feature bullet points based on these details:
- Product Title: ${ctx.title || ctx.rawText || 'Product'}
- Brand: ${ctx.brand || 'Listivo Craft'}
- Category: ${ctx.category || 'General'} / ${ctx.subCategory || ''}
- Material / Fabric: ${ctx.material || 'Quality Material'}
- Color / Design: ${ctx.color || ''} ${ctx.pattern || ''}
- Price / MRP: Selling Price Rs. ${ctx.price || ''}, MRP Rs. ${ctx.mrp || ''}
- Existing Features: ${JSON.stringify(ctx.keyFeatures || [])}
- Tone style: ${selectedTone}
- Custom Instructions: ${ctx.customInstructions || 'None'}

${COMMON_SAFETY_INSTRUCTIONS}

Respond ONLY in valid JSON format with keys:
{
  "description": "Engaging 2-3 paragraph product description highlighting utility, comfort, build quality, and value",
  "keyFeatures": [
    "Key benefit bullet point 1 (Fabric/Material detail)",
    "Key benefit bullet point 2 (Design & Fit detail)",
    "Key benefit bullet point 3 (Occasion & Utility detail)",
    "Key benefit bullet point 4 (Care & Washing instruction)"
  ]
}`;
}

export function getBulletPrompt(ctx: PromptContext): string {
  return `You are an e-commerce copywriter creating bullet points for an Indian marketplace listing.
Details:
- Title: ${ctx.title || 'Product'}
- Brand: ${ctx.brand || ''}
- Material: ${ctx.material || ''}
- Features/Notes: ${ctx.rawText || JSON.stringify(ctx.keyFeatures || [])}

${COMMON_SAFETY_INSTRUCTIONS}

Respond ONLY in valid JSON format:
{
  "bulletPoints": [
    "Bullet point 1 highlighting material quality and durability",
    "Bullet point 2 highlighting design, fit, or style",
    "Bullet point 3 highlighting versatility, occasion, or comfort",
    "Bullet point 4 highlighting care instructions or package contents"
  ]
}`;
}

export function getKeywordPrompt(ctx: PromptContext): string {
  return `You are an e-commerce SEO specialist for Meesho, Flipkart, and Amazon India.
Generate high-relevance search keywords based on product details:
- Title / Concept: ${ctx.title || ctx.rawText || 'Product'}
- Brand: ${ctx.brand || ''}
- Category: ${ctx.category || ''} ${ctx.subCategory || ''}
- Material / Color: ${ctx.material || ''} ${ctx.color || ''}

CRITICAL DISCLAIMER RULE:
Keyword suggestions are generated strictly based on product attributes and language patterns. Do NOT invent fake search volume numbers, monthly searches, CPC rupees, or competition rankings.

${COMMON_SAFETY_INSTRUCTIONS}

Respond ONLY in valid JSON format:
{
  "primaryKeywords": ["3-5 core search terms buyers type"],
  "secondaryKeywords": ["4-6 descriptive attribute search terms"],
  "longTailKeywords": ["3-5 intent-rich phrase searches e.g. kurti under 500 for festive wear"],
  "relatedPhrases": ["3-4 trending category terms"],
  "disclaimer": "AI-generated keyword suggestions based on product attributes. Search volume or ranking metrics are not implied."
}`;
}

export function getAttributePrompt(ctx: PromptContext): string {
  return `You are a catalog data analyst. Extract and infer marketplace attributes from raw product details.
Details:
- Title / Notes: ${ctx.title || ctx.rawText || 'Product'}
- Category: ${ctx.category || ''}
- Material: ${ctx.material || ''}

${COMMON_SAFETY_INSTRUCTIONS}

Respond ONLY in valid JSON format with an array of key-value attributes:
{
  "attributes": [
    { "key": "fabric", "label": "Fabric Material", "value": "Rayon" },
    { "key": "pattern", "label": "Pattern", "value": "Printed" },
    { "key": "fit", "label": "Fit / Shape", "value": "Regular Fit" },
    { "key": "occasion", "label": "Occasion", "value": "Festive & Casual" },
    { "key": "care_instruction", "label": "Care Instructions", "value": "Hand Wash Cold" }
  ]
}`;
}

export function getRefinementPrompt(currentText: string, instruction: string, ctx: PromptContext): string {
  return `You are an expert copywriter refining product content for an e-commerce catalog.
Current Text:
"""
${currentText}
"""

Refinement Directive: ${instruction}
Product Context: Brand ${ctx.brand || 'Generic'}, Category ${ctx.category || 'General'}, Marketplace ${ctx.marketplace || 'Meesho'}.

${COMMON_SAFETY_INSTRUCTIONS}

Respond ONLY in valid JSON format:
{
  "refinedText": "The updated and refined text according to instructions",
  "changesMade": "Brief summary of changes applied"
}`;
}

export function getQualityAnalysisPrompt(ctx: PromptContext): string {
  return `You are a Senior E-commerce Catalog Quality Auditor for Meesho, Flipkart, and Amazon India.
Analyze this product listing for quality, SEO completeness, readability, and marketplace compliance:

- Title: "${ctx.title || ''}"
- Description: "${ctx.title || ''}"
- Key Features: ${JSON.stringify(ctx.keyFeatures || [])}
- Material: "${ctx.material || ''}"
- Brand: "${ctx.brand || ''}"
- Target Marketplace: ${(ctx.marketplace || 'meesho').toUpperCase()}

Evaluate against these criteria:
1. Title clarity, character count, and keyword inclusion (0-100)
2. Description depth, formatting, and readability (0-100)
3. Key feature bullets presence and value proposition (0-100)
4. Attribute completeness (0-100)
5. Marketplace policy compliance (0-100)

${COMMON_SAFETY_INSTRUCTIONS}

Respond ONLY in valid JSON format:
{
  "overallScore": 88,
  "titleScore": 90,
  "descriptionScore": 85,
  "keywordScore": 85,
  "attributeScore": 90,
  "complianceScore": 95,
  "suggestions": [
    "Add length measurement or size guide details in description",
    "Mention care instructions explicitly in key features",
    "Include festive or seasonal keyword variations for better visibility"
  ]
}`;
}

export function getSmartListingPrompt(rawText: string, marketplace: string, brand?: string): string {
  return `You are an AI Smart Listing Generator for Indian marketplace sellers (Meesho, Flipkart, Amazon).
Transform the following raw product notes or title into a complete, professional catalog listing:

Raw Input Notes: "${rawText}"
Target Marketplace: ${(marketplace || 'meesho').toUpperCase()}
Brand Override: "${brand || ''}"

${COMMON_SAFETY_INSTRUCTIONS}

Respond ONLY in valid JSON format:
{
  "title": "Optimized, high-converting product title following target marketplace rules",
  "category": "Inferred category (e.g. Women Ethnic Wear)",
  "subCategory": "Inferred subcategory (e.g. Kurtis)",
  "brand": "Inferred or specified brand name",
  "material": "Inferred fabric/material",
  "suggestedPrice": 499,
  "suggestedMRP": 999,
  "sku": "Suggested SKU string e.g. KURTI-RAYON-001",
  "description": "Engaging 2-paragraph seller description",
  "keyFeatures": [
    "Feature 1: Material and comfort",
    "Feature 2: Design and pattern details",
    "Feature 3: Occasion suitability",
    "Feature 4: Washing & care instructions"
  ],
  "keywords": {
    "primary": ["primary keyword 1", "primary keyword 2", "primary keyword 3"],
    "secondary": ["secondary keyword 1", "secondary keyword 2"],
    "longTail": ["long tail keyword phrase 1", "long tail keyword phrase 2"],
    "related": ["category search phrase 1"]
  },
  "attributes": [
    { "key": "fabric", "label": "Fabric Material", "value": "Rayon" },
    { "key": "fit", "label": "Fit Type", "value": "Regular Fit" },
    { "key": "neck_type", "label": "Neck Type", "value": "Round Neck" },
    { "key": "sleeve_length", "label": "Sleeve Length", "value": "Three-Quarter Sleeves" }
  ],
  "qualityScore": {
    "overall": 92,
    "titleScore": 95,
    "descriptionScore": 90,
    "keywordScore": 90,
    "attributeScore": 90,
    "complianceScore": 95,
    "suggestions": [
      "Add high-resolution image URLs to reach 100% ready state",
      "Verify HSN code 6204 for GST billing"
    ]
  }
}`;
}
