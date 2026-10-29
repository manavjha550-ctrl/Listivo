/**
 * Listing AI Orchestrator Service
 * Coordinates AI prompts, Gemini execution, safety validation, and usage logging.
 */

import { generateJSONWithGemini } from './geminiService.js';
import {
  PromptContext,
  getTitlePrompt,
  getDescriptionPrompt,
  getBulletPrompt,
  getAttributePrompt,
  getRefinementPrompt,
  getQualityAnalysisPrompt,
  getSmartListingPrompt,
} from './promptService.js';
import { validateAITitle, validateAIDescription, ValidationResult } from './validationService.js';
import { logAIUsage } from './usageService.js';
import { generateAIKeywords, KeywordResult } from './keywordService.js';

export async function generateAITitle(ctx: PromptContext, userId = 'owner'): Promise<{
  recommendedTitle: string;
  alternativeTitles: string[];
  reasoning: string;
  validation: ValidationResult;
  source: string;
}> {
  const prompt = getTitlePrompt(ctx);
  const fallback = {
    recommendedTitle: `${ctx.brand || 'Brand'} ${ctx.category || 'Product'} ${ctx.material || ''} ${ctx.color || ''}`.replace(/\s+/g, ' ').trim(),
    alternativeTitles: [
      `${ctx.material || 'Quality'} ${ctx.subCategory || ctx.category || 'Product'} - ${ctx.brand || 'Listivo'}`,
      `Women ${ctx.subCategory || 'Wear'} ${ctx.color || 'Printed'} (${ctx.brand || 'Brand'})`,
    ],
    reasoning: 'Generated from core product attributes for optimal marketplace compliance.',
  };

  const res = await generateJSONWithGemini(prompt, fallback);
  const title = res.data.recommendedTitle || fallback.recommendedTitle;
  const validation = validateAITitle(title);

  logAIUsage(userId, 'title', 'SUCCESS');

  return {
    recommendedTitle: title,
    alternativeTitles: res.data.alternativeTitles || fallback.alternativeTitles,
    reasoning: res.data.reasoning || fallback.reasoning,
    validation,
    source: res.source,
  };
}

export async function generateAIDescription(ctx: PromptContext, userId = 'owner'): Promise<{
  description: string;
  keyFeatures: string[];
  validation: ValidationResult;
  source: string;
}> {
  const prompt = getDescriptionPrompt(ctx);
  const fallback = {
    description: `Elevate your catalog with this premium ${ctx.title || 'product'} from ${ctx.brand || 'our collection'}. Expertly crafted from high-grade ${ctx.material || 'fabric'}, this item delivers an unmatched combination of elegance, durability, and value. Specially formatted for Meesho, Flipkart, and Amazon buyers.`,
    keyFeatures: [
      `Premium ${ctx.material || 'durable material'} for long-lasting comfort`,
      `Designed by ${ctx.brand || 'Listivo Craft'} with precision finish`,
      `Ideal choice for festive, casual, or daily wear`,
      `Easy to maintain and machine/hand washable`,
    ],
  };

  const res = await generateJSONWithGemini(prompt, fallback);
  const description = res.data.description || fallback.description;
  const keyFeatures = res.data.keyFeatures || fallback.keyFeatures;
  const validation = validateAIDescription(description);

  logAIUsage(userId, 'description', 'SUCCESS');

  return {
    description,
    keyFeatures,
    validation,
    source: res.source,
  };
}

export async function generateAIBullets(ctx: PromptContext, userId = 'owner'): Promise<{
  bulletPoints: string[];
  source: string;
}> {
  const prompt = getBulletPrompt(ctx);
  const fallback = {
    bulletPoints: [
      `Soft and breathable ${ctx.material || 'quality fabric'} for all-day comfort`,
      `Precision stitching with attractive ${ctx.pattern || 'design'} finish`,
      `Versatile choice suitable for festive, work, or casual wear`,
      `Color-fast durable material, easy care and wash`,
    ],
  };

  const res = await generateJSONWithGemini(prompt, fallback);
  logAIUsage(userId, 'bullet', 'SUCCESS');

  return {
    bulletPoints: res.data.bulletPoints || fallback.bulletPoints,
    source: res.source,
  };
}

export async function generateAIAttributes(ctx: PromptContext, userId = 'owner'): Promise<{
  attributes: Array<{ key: string; label: string; value: string }>;
  source: string;
}> {
  const prompt = getAttributePrompt(ctx);
  const fallback = {
    attributes: [
      { key: 'fabric', label: 'Fabric / Material', value: ctx.material || 'Rayon' },
      { key: 'pattern', label: 'Pattern', value: ctx.pattern || 'Printed' },
      { key: 'fit', label: 'Fit Type', value: 'Regular Fit' },
      { key: 'occasion', label: 'Occasion', value: 'Festive & Casual' },
      { key: 'sleeve_length', label: 'Sleeve Length', value: 'Three-Quarter Sleeves' },
    ],
  };

  const res = await generateJSONWithGemini(prompt, fallback);
  logAIUsage(userId, 'attributes', 'SUCCESS');

  return {
    attributes: res.data.attributes || fallback.attributes,
    source: res.source,
  };
}

export async function refineAIText(
  currentText: string,
  instruction: string,
  ctx: PromptContext,
  userId = 'owner'
): Promise<{
  refinedText: string;
  changesMade: string;
  source: string;
}> {
  const prompt = getRefinementPrompt(currentText, instruction, ctx);
  const fallback = {
    refinedText: `${currentText}\n\n[Refined for ${ctx.marketplace || 'Meesho'} buyers with emphasis on quality and value.]`,
    changesMade: `Applied prompt instruction: ${instruction}`,
  };

  const res = await generateJSONWithGemini(prompt, fallback);
  logAIUsage(userId, 'refine', 'SUCCESS');

  return {
    refinedText: res.data.refinedText || fallback.refinedText,
    changesMade: res.data.changesMade || fallback.changesMade,
    source: res.source,
  };
}

export async function analyzeAIQuality(ctx: PromptContext, userId = 'owner'): Promise<{
  overallScore: number;
  titleScore: number;
  descriptionScore: number;
  keywordScore: number;
  attributeScore: number;
  complianceScore: number;
  suggestions: string[];
  source: string;
}> {
  const prompt = getQualityAnalysisPrompt(ctx);
  const fallback = {
    overallScore: 88,
    titleScore: 90,
    descriptionScore: 85,
    keywordScore: 85,
    attributeScore: 90,
    complianceScore: 95,
    suggestions: [
      'Add specific fabric weight or wash care details in bullet points.',
      'Ensure MRP discount percentage is above 40% for better Meesho click-through rate.',
      'Include festive or seasonal keyword variations in product tags.',
    ],
  };

  const res = await generateJSONWithGemini(prompt, fallback);
  logAIUsage(userId, 'quality_audit', 'SUCCESS');

  return {
    overallScore: res.data.overallScore || fallback.overallScore,
    titleScore: res.data.titleScore || fallback.titleScore,
    descriptionScore: res.data.descriptionScore || fallback.descriptionScore,
    keywordScore: res.data.keywordScore || fallback.keywordScore,
    attributeScore: res.data.attributeScore || fallback.attributeScore,
    complianceScore: res.data.complianceScore || fallback.complianceScore,
    suggestions: res.data.suggestions || fallback.suggestions,
    source: res.source,
  };
}

export async function generateSmartListing(
  rawText: string,
  marketplace = 'meesho',
  brand = '',
  userId = 'owner'
): Promise<{
  title: string;
  category: string;
  subCategory: string;
  brand: string;
  material: string;
  suggestedPrice: number;
  suggestedMRP: number;
  sku: string;
  description: string;
  keyFeatures: string[];
  keywords: KeywordResult;
  attributes: Array<{ key: string; label: string; value: string }>;
  qualityScore: {
    overall: number;
    titleScore: number;
    descriptionScore: number;
    keywordScore: number;
    attributeScore: number;
    complianceScore: number;
    suggestions: string[];
  };
  source: string;
}> {
  const prompt = getSmartListingPrompt(rawText, marketplace, brand);

  const fallback = {
    title: `${brand ? brand + ' ' : ''}${rawText} - Premium Festive Edition`,
    category: 'Apparel',
    subCategory: 'Kurtis',
    brand: brand || 'Generic',
    material: 'Rayon Mix',
    suggestedPrice: 499,
    suggestedMRP: 999,
    sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
    description: `High quality ${rawText} crafted for maximum comfort and style. Perfect for festive and everyday wear on ${marketplace.toUpperCase()}.`,
    keyFeatures: [
      'Premium soft breathable Rayon fabric',
      'Vibrant color fastness and neat stitch line',
      'Comfortable regular fit for Indian body types',
      'Easy hand wash cold or gentle machine wash',
    ],
    keywords: {
      primaryKeywords: [`${rawText} for women`, `${brand || 'kurti'} online`],
      secondaryKeywords: ['festive rayon kurti', 'meesho top seller apparel'],
      longTailKeywords: [`${rawText} under 500 festive`],
      relatedPhrases: ['women ethnic fashion'],
      disclaimer: 'AI-generated keyword suggestions based on product attributes.',
    },
    attributes: [
      { key: 'fabric', label: 'Fabric Material', value: 'Rayon' },
      { key: 'pattern', label: 'Pattern', value: 'Printed' },
      { key: 'fit', label: 'Fit', value: 'Regular Fit' },
      { key: 'neck_type', label: 'Neck Type', value: 'Round Neck' },
    ],
    qualityScore: {
      overall: 90,
      titleScore: 92,
      descriptionScore: 88,
      keywordScore: 88,
      attributeScore: 90,
      complianceScore: 95,
      suggestions: ['Add product image URLs to achieve 100% catalog score.'],
    },
  };

  const res = await generateJSONWithGemini(prompt, fallback);
  logAIUsage(userId, 'smart_listing', 'SUCCESS');

  return {
    title: res.data.title || fallback.title,
    category: res.data.category || fallback.category,
    subCategory: res.data.subCategory || fallback.subCategory,
    brand: res.data.brand || fallback.brand,
    material: res.data.material || fallback.material,
    suggestedPrice: res.data.suggestedPrice || fallback.suggestedPrice,
    suggestedMRP: res.data.suggestedMRP || fallback.suggestedMRP,
    sku: res.data.sku || fallback.sku,
    description: res.data.description || fallback.description,
    keyFeatures: res.data.keyFeatures || fallback.keyFeatures,
    keywords: {
      primaryKeywords: res.data.keywords?.primary || fallback.keywords.primaryKeywords,
      secondaryKeywords: res.data.keywords?.secondary || fallback.keywords.secondaryKeywords,
      longTailKeywords: res.data.keywords?.longTail || fallback.keywords.longTailKeywords,
      relatedPhrases: res.data.keywords?.related || fallback.keywords.relatedPhrases,
      disclaimer: 'AI-generated keyword suggestions based on product attributes. Search volume or ranking metrics are not implied.',
    },
    attributes: res.data.attributes || fallback.attributes,
    qualityScore: res.data.qualityScore || fallback.qualityScore,
    source: res.source,
  };
}
