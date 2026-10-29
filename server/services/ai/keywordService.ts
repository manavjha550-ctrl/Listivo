/**
 * AI Keyword Generation, Intelligence & Quality Analysis Service
 * Optimized for Indian marketplace algorithms (Meesho, Flipkart, Amazon, Myntra).
 */

import { generateJSONWithGemini } from './geminiService.js';
import { getKeywordPrompt, PromptContext } from './promptService.js';

export interface KeywordIntelligenceItem {
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

export interface KeywordResearchInput {
  productName: string;
  category?: string;
  description?: string;
  material?: string;
  color?: string;
  size?: string;
  targetCustomer?: string;
  marketplace?: string;
  language?: string;
  customInstructions?: string;
}

export interface KeywordResearchResult {
  keywords: KeywordIntelligenceItem[];
  summary: {
    totalKeywords: number;
    primaryCount: number;
    secondaryCount: number;
    longTailCount: number;
    attributeCount: number;
    buyingIntentCount: number;
    seasonalCount: number;
  };
  marketplace: string;
  disclaimer: string;
}

export interface KeywordResult {
  primaryKeywords: string[];
  secondaryKeywords: string[];
  longTailKeywords: string[];
  relatedPhrases: string[];
  disclaimer: string;
}

export async function generateAIKeywords(ctx: PromptContext): Promise<{ data: KeywordResult; source: 'gemini-ai' | 'smart-template-engine' }> {
  const prompt = getKeywordPrompt(ctx);

  const fallback: KeywordResult = {
    primaryKeywords: [
      `${ctx.title || 'Product'} for women`,
      `${ctx.brand || 'Brand'} ${ctx.category || 'ethnic wear'}`,
      `${ctx.material || 'rayon'} ${ctx.subCategory || 'kurti'}`,
    ],
    secondaryKeywords: [
      `festive ${ctx.subCategory || 'wear'}`,
      `designer ${ctx.category || 'ethnic'}`,
      `latest ${ctx.subCategory || 'product'} 2025`,
      `comfortable ${ctx.material || 'fabric'}`,
    ],
    longTailKeywords: [
      `${ctx.material || 'rayon'} ${ctx.subCategory || 'kurti'} under 500`,
      `best ${ctx.category || 'ethnic wear'} for festive season`,
      `easy wash ${ctx.material || 'soft'} ${ctx.subCategory || 'outfit'}`,
    ],
    relatedPhrases: [
      `trending ${ctx.category || 'women fashion'}`,
      `meesho top seller ${ctx.subCategory || 'style'}`,
    ],
    disclaimer: 'Search volume unavailable — relevance is AI-estimated.',
  };

  const result = await generateJSONWithGemini(prompt, fallback);

  if (result.data) {
    result.data.disclaimer = 'Search volume unavailable — relevance is AI-estimated.';
  }

  return result as { data: KeywordResult; source: 'gemini-ai' | 'smart-template-engine' };
}

/**
 * Perform Phase 7C Keyword Intelligence Research
 */
export async function researchAIKeywords(input: KeywordResearchInput): Promise<{ data: KeywordResearchResult; source: 'gemini-ai' | 'smart-template-engine' }> {
  const name = (input.productName || 'Product').trim();
  const mkt = (input.marketplace || 'meesho').toLowerCase();
  const cat = input.category || 'Apparel & Fashion';
  const mat = input.material || 'Quality Fabric';
  const col = input.color || '';
  const tgt = input.targetCustomer || 'Women & Girls';

  const prompt = `
You are an expert e-commerce SEO specialist for Indian marketplaces (${mkt.toUpperCase()}, Flipkart, Amazon India, Myntra).
Analyze this product and generate categorized search keywords:
Product Name: ${name}
Category: ${cat}
Material: ${mat}
Color: ${col}
Target Customer: ${tgt}
Marketplace: ${mkt}
Description: ${input.description || ''}
Instructions: ${input.customInstructions || ''}

Return ONLY a JSON object with this exact structure:
{
  "keywords": [
    {
      "keyword": "string",
      "category": "PRIMARY" | "SECONDARY" | "LONG-TAIL" | "ATTRIBUTE" | "BUYING-INTENT" | "SEASONAL",
      "relevanceScore": 95,
      "suggestedUsage": "Where to place in listing (e.g. Title, First 100 chars of Description, Search Tags)",
      "confidenceLabel": "HIGH" | "MEDIUM" | "LOW",
      "intent": "HIGH" | "MEDIUM" | "LOW",
      "risk": "LOW" | "MEDIUM" | "HIGH"
    }
  ]
}
Provide at least 12-18 highly targeted keywords covering all categories. Do NOT invent search volume numbers.
`;

  // Rule-based fallback if Gemini API is offline or rate limited
  const fallbackKeywords: KeywordIntelligenceItem[] = [
    {
      id: `kw-fallback-1`,
      keyword: `${name.toLowerCase()} for ${tgt.toLowerCase()}`,
      category: 'PRIMARY',
      relevanceScore: 98,
      suggestedUsage: 'Title & Main Product Bullet',
      confidenceLabel: 'HIGH',
      intent: 'HIGH',
      risk: 'LOW',
      status: 'active',
    },
    {
      id: `kw-fallback-2`,
      keyword: `${mat.toLowerCase()} ${name.toLowerCase()} ${mkt} best seller`,
      category: 'PRIMARY',
      relevanceScore: 95,
      suggestedUsage: 'Title & High Priority Keywords',
      confidenceLabel: 'HIGH',
      intent: 'HIGH',
      risk: 'LOW',
      status: 'active',
    },
    {
      id: `kw-fallback-3`,
      keyword: `printed ${mat.toLowerCase()} ethnic wear`,
      category: 'SECONDARY',
      relevanceScore: 90,
      suggestedUsage: 'Product Features & Description',
      confidenceLabel: 'HIGH',
      intent: 'MEDIUM',
      risk: 'LOW',
      status: 'active',
    },
    {
      id: `kw-fallback-4`,
      keyword: `designer ${col ? col.toLowerCase() + ' ' : ''}${cat.toLowerCase()}`,
      category: 'SECONDARY',
      relevanceScore: 88,
      suggestedUsage: 'Description Bullet Points',
      confidenceLabel: 'MEDIUM',
      intent: 'MEDIUM',
      risk: 'LOW',
      status: 'active',
    },
    {
      id: `kw-fallback-5`,
      keyword: `${mat.toLowerCase()} ${name.toLowerCase()} under 500`,
      category: 'LONG-TAIL',
      relevanceScore: 94,
      suggestedUsage: 'First 200 chars of Description',
      confidenceLabel: 'HIGH',
      intent: 'HIGH',
      risk: 'LOW',
      status: 'active',
    },
    {
      id: `kw-fallback-6`,
      keyword: `latest daily wear ${name.toLowerCase()} for office and home`,
      category: 'LONG-TAIL',
      relevanceScore: 89,
      suggestedUsage: 'Search Tags & Secondary Description',
      confidenceLabel: 'HIGH',
      intent: 'HIGH',
      risk: 'LOW',
      status: 'active',
    },
    {
      id: `kw-fallback-7`,
      keyword: `100% breathable ${mat.toLowerCase()} fabric`,
      category: 'ATTRIBUTE',
      relevanceScore: 91,
      suggestedUsage: 'Fabric & Material Specifications',
      confidenceLabel: 'HIGH',
      intent: 'MEDIUM',
      risk: 'LOW',
      status: 'active',
    },
    {
      id: `kw-fallback-8`,
      keyword: `${col ? col.toLowerCase() + ' color ' : ''}soft touch material`,
      category: 'ATTRIBUTE',
      relevanceScore: 86,
      suggestedUsage: 'Key Attributes Section',
      confidenceLabel: 'MEDIUM',
      intent: 'LOW',
      risk: 'LOW',
      status: 'active',
    },
    {
      id: `kw-fallback-9`,
      keyword: `buy trending ${name.toLowerCase()} online combo`,
      category: 'BUYING-INTENT',
      relevanceScore: 87,
      suggestedUsage: 'Search Backend Tags',
      confidenceLabel: 'MEDIUM',
      intent: 'HIGH',
      risk: 'LOW',
      status: 'active',
    },
    {
      id: `kw-fallback-10`,
      keyword: `top rated ${cat.toLowerCase()} collection`,
      category: 'BUYING-INTENT',
      relevanceScore: 84,
      suggestedUsage: 'Promotional Text & Search Keywords',
      confidenceLabel: 'MEDIUM',
      intent: 'HIGH',
      risk: 'LOW',
      status: 'active',
    },
    {
      id: `kw-fallback-11`,
      keyword: `festive diwali ethnic wear ${name.toLowerCase()}`,
      category: 'SEASONAL',
      relevanceScore: 90,
      suggestedUsage: 'Festive Campaign Search Tags',
      confidenceLabel: 'HIGH',
      intent: 'HIGH',
      risk: 'LOW',
      status: 'active',
    },
    {
      id: `kw-fallback-12`,
      keyword: `wedding season party wear ${name.toLowerCase()} set`,
      category: 'SEASONAL',
      relevanceScore: 86,
      suggestedUsage: 'Occasion Attribute & Keywords',
      confidenceLabel: 'MEDIUM',
      intent: 'HIGH',
      risk: 'LOW',
      status: 'active',
    },
  ];

  const geminiRes = await generateJSONWithGemini(prompt, { keywords: fallbackKeywords });
  const source = geminiRes.source;

  let rawList = geminiRes.data?.keywords || fallbackKeywords;

  // Format and assign IDs & defaults
  const formattedKeywords: KeywordIntelligenceItem[] = rawList.map((item: any, idx: number) => ({
    id: `kw-${Date.now()}-${idx}`,
    keyword: String(item.keyword || `${name} item`).toLowerCase().trim(),
    category: ['PRIMARY', 'SECONDARY', 'LONG-TAIL', 'ATTRIBUTE', 'BUYING-INTENT', 'SEASONAL'].includes(item.category)
      ? item.category
      : 'PRIMARY',
    relevanceScore: Math.min(100, Math.max(50, Number(item.relevanceScore) || 85)),
    suggestedUsage: item.suggestedUsage || 'Title & Description',
    confidenceLabel: ['HIGH', 'MEDIUM', 'LOW'].includes(item.confidenceLabel) ? item.confidenceLabel : 'HIGH',
    intent: ['HIGH', 'MEDIUM', 'LOW'].includes(item.intent) ? item.intent : 'HIGH',
    risk: ['LOW', 'MEDIUM', 'HIGH'].includes(item.risk) ? item.risk : 'LOW',
    status: 'active',
  }));

  const summary = {
    totalKeywords: formattedKeywords.length,
    primaryCount: formattedKeywords.filter((k) => k.category === 'PRIMARY').length,
    secondaryCount: formattedKeywords.filter((k) => k.category === 'SECONDARY').length,
    longTailCount: formattedKeywords.filter((k) => k.category === 'LONG-TAIL').length,
    attributeCount: formattedKeywords.filter((k) => k.category === 'ATTRIBUTE').length,
    buyingIntentCount: formattedKeywords.filter((k) => k.category === 'BUYING-INTENT').length,
    seasonalCount: formattedKeywords.filter((k) => k.category === 'SEASONAL').length,
  };

  return {
    data: {
      keywords: formattedKeywords,
      summary,
      marketplace: mkt,
      disclaimer: 'Search volume unavailable — relevance is AI-estimated.',
    },
    source,
  };
}

/**
 * Quality Analysis of Keywords
 */
export function analyzeKeywordsQuality(keywords: KeywordIntelligenceItem[], contextText?: string) {
  const total = keywords.length;
  if (total === 0) {
    return {
      relevance: 'LOW',
      specificity: 'LOW',
      commercialIntent: 'LOW',
      attributeCoverage: 'LOW',
      duplicationRisk: 'LOW',
      keywordStuffingRisk: 'LOW',
      score: 40,
    };
  }

  const avgRelevance = keywords.reduce((sum, k) => sum + k.relevanceScore, 0) / total;
  const highIntentCount = keywords.filter((k) => k.intent === 'HIGH').length;
  const attributeCount = keywords.filter((k) => k.category === 'ATTRIBUTE').length;
  const longTailCount = keywords.filter((k) => k.category === 'LONG-TAIL').length;

  // Check repetition / stuffing
  const wordSet = new Set<string>();
  let dupWords = 0;
  keywords.forEach((k) => {
    const parts = k.keyword.split(' ');
    parts.forEach((p) => {
      if (wordSet.has(p)) dupWords++;
      else wordSet.add(p);
    });
  });

  const duplicationRisk = dupWords > total * 2 ? 'HIGH' : dupWords > total ? 'MEDIUM' : 'LOW';
  const stuffingRisk = keywords.length > 25 || duplicationRisk === 'HIGH' ? 'HIGH' : keywords.length > 18 ? 'MEDIUM' : 'LOW';

  const relevance = avgRelevance >= 88 ? 'HIGH' : avgRelevance >= 75 ? 'MEDIUM' : 'LOW';
  const specificity = longTailCount >= 3 ? 'HIGH' : longTailCount >= 1 ? 'MEDIUM' : 'LOW';
  const commercialIntent = highIntentCount >= total * 0.4 ? 'HIGH' : highIntentCount >= 2 ? 'MEDIUM' : 'LOW';
  const attributeCoverage = attributeCount >= 2 ? 'HIGH' : attributeCount >= 1 ? 'MEDIUM' : 'LOW';

  let score = Math.round(avgRelevance);
  if (stuffingRisk === 'HIGH') score -= 15;
  if (attributeCoverage === 'HIGH') score += 5;

  return {
    relevance,
    specificity,
    commercialIntent,
    attributeCoverage,
    duplicationRisk,
    keywordStuffingRisk: stuffingRisk,
    score: Math.min(100, Math.max(30, score)),
  };
}

/**
 * Title Generator with Selected Keywords
 */
export async function optimizeTitleWithKeywords(params: {
  keywords: string[];
  productName: string;
  marketplace?: string;
  brand?: string;
  material?: string;
  color?: string;
}) {
  const mkt = (params.marketplace || 'meesho').toLowerCase();
  const maxChars = mkt === 'amazon' ? 200 : mkt === 'flipkart' ? 150 : 120;

  const topKws = params.keywords.slice(0, 5).join(', ');
  const prompt = `
Construct a high-converting marketplace product title for ${mkt.toUpperCase()} (Max ${maxChars} characters).
Product Name: ${params.productName}
Brand: ${params.brand || 'Generic'}
Material: ${params.material || ''}
Color: ${params.color || ''}
Include keywords naturally: ${topKws}

Return JSON:
{
  "title": "Generated Marketplace Title String",
  "usedKeywords": ["kw1", "kw2"],
  "warnings": ["Warning if title is too repetitive or long"]
}
`;

  const fallbackTitle = `${params.brand ? params.brand + ' ' : ''}${params.productName}${params.material ? ' in ' + params.material : ''}${params.color ? ' (' + params.color + ')' : ''}${params.keywords.length ? ' - ' + params.keywords[0] : ''}`;
  const truncatedFallback = fallbackTitle.slice(0, maxChars);

  const fallback = {
    title: truncatedFallback,
    usedKeywords: params.keywords.slice(0, 3),
    warnings: truncatedFallback.length >= maxChars ? ['Title length reached marketplace character limit.'] : [],
  };

  const res = await generateJSONWithGemini(prompt, fallback);
  const data = res.data || fallback;

  // Repetition check
  const words = data.title.toLowerCase().split(/\s+/);
  const freq: Record<string, number> = {};
  words.forEach((w) => {
    if (w.length > 3) freq[w] = (freq[w] || 0) + 1;
  });

  const repWarnings: string[] = [...(data.warnings || [])];
  Object.entries(freq).forEach(([w, count]) => {
    if (count > 2) repWarnings.push(`Keyword "${w}" is repeated ${count} times in the title.`);
  });

  return {
    title: data.title,
    characterCount: data.title.length,
    maxAllowedCharacters: maxChars,
    usedKeywords: data.usedKeywords || params.keywords.slice(0, 3),
    warnings: Array.from(new Set(repWarnings)),
  };
}

/**
 * Description Optimizer with Selected Keywords
 */
export async function optimizeDescriptionWithKeywords(params: {
  originalDescription: string;
  keywords: string[];
  marketplace?: string;
  material?: string;
  color?: string;
  productName?: string;
}) {
  const orig = params.originalDescription || '';
  const kws = params.keywords || [];

  // Coverage check
  const missingKws = kws.filter((k) => !orig.toLowerCase().includes(k.toLowerCase()));
  const coveredCount = kws.length - missingKws.length;
  const currentCoveragePct = kws.length > 0 ? Math.round((coveredCount / kws.length) * 100) : 50;

  const currentScore = Math.min(95, Math.max(30, currentCoveragePct));
  const potentialScore = Math.min(100, Math.max(85, currentScore + 25));

  const suggestions: string[] = [];
  if (missingKws.length > 0) {
    suggestions.push(`Include missing high-intent keywords: ${missingKws.slice(0, 3).join(', ')}.`);
  }
  if (!orig.toLowerCase().includes('wash') && !orig.toLowerCase().includes('care')) {
    suggestions.push('Add wash and fabric care instructions to increase buyer trust.');
  }
  if (orig.length < 150) {
    suggestions.push('Expand description length to at least 250 characters for search indexing.');
  }

  const prompt = `
Optimize this e-commerce product description for ${params.marketplace || 'Meesho'}.
Original Description: ${orig}
Product Name: ${params.productName || 'Product'}
Material: ${params.material || ''}
Color: ${params.color || ''}
Naturally incorporate these key search phrases without keyword stuffing: ${kws.join(', ')}

Return JSON:
{
  "optimizedDescription": "New enhanced product description paragraph incorporating keywords smoothly.",
  "suggestions": ["suggestion 1", "suggestion 2"]
}
`;

  const fallbackOptimized = `${orig}\n\nKey Highlights:\n- Material & Fabric: ${params.material || 'Premium Quality'}\n- Style & Occasion: Designed for comfort and everyday wear.\n- Search Tags: ${kws.join(', ')}`;

  const res = await generateJSONWithGemini(prompt, {
    optimizedDescription: fallbackOptimized,
    suggestions,
  });

  return {
    currentScore,
    potentialScore,
    missingKeywords: missingKws,
    suggestions: res.data?.suggestions || suggestions,
    originalDescription: orig,
    optimizedDescription: res.data?.optimizedDescription || fallbackOptimized,
  };
}
