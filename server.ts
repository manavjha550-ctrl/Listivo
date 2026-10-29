import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_USERS,
  INITIAL_PROFILES,
  INITIAL_TEMPLATES,
  INITIAL_PRODUCTS,
  INITIAL_ACTIVITIES,
  INITIAL_BULK_IMPORTS,
  INITIAL_MAPPING_PRESETS,
  INITIAL_PRICING_RULES,
  OWNER_EMAIL,
  DBUser,
  DBProfile,
  DBProduct,
  DBValidationResult,
  DBBulkImport,
  DBColumnMappingPreset,
  DBPricingRule,
  DBBulkExportJob,
  DBAIJob,
  DBAIGenerationVersion,
  DBSmartListingDraft,
  DBKeywordSet,
  INITIAL_KEYWORD_SETS,
} from './server/db/schema.js';

import {
  generateAITitle,
  generateAIDescription,
  generateAIBullets,
  generateAIAttributes,
  refineAIText,
  analyzeAIQuality,
  generateSmartListing as createSmartListing,
} from './server/services/ai/listingAIService.js';
import {
  generateAIKeywords,
  researchAIKeywords,
  analyzeKeywordsQuality,
  optimizeTitleWithKeywords,
  optimizeDescriptionWithKeywords,
} from './server/services/ai/keywordService.js';
import { getUserUsageSummary } from './server/services/ai/usageService.js';

// In-Memory Database Stores for API runtime (backed by PostgreSQL schema)
const db = {
  users: [...INITIAL_USERS],
  profiles: [...INITIAL_PROFILES],
  templates: [...INITIAL_TEMPLATES],
  products: [...INITIAL_PRODUCTS],
  activities: [...INITIAL_ACTIVITIES],
  bulkImports: [...INITIAL_BULK_IMPORTS] as DBBulkImport[],
  mappingPresets: [...INITIAL_MAPPING_PRESETS] as DBColumnMappingPreset[],
  bulkExports: [] as DBBulkExportJob[],
  aiJobs: [] as DBAIJob[],
  aiVersions: [] as DBAIGenerationVersion[],
  smartListings: [] as DBSmartListingDraft[],
  pricingRules: [...INITIAL_PRICING_RULES] as DBPricingRule[],
  keywordSets: [...INITIAL_KEYWORD_SETS] as DBKeywordSet[],
};

// Initialize Gemini Client
let genAIClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Server-side Product Validation Engine
function validateProductData(product: Partial<DBProduct>): DBValidationResult {
  const issues: DBValidationResult['issues'] = [];

  if (!product.title || product.title.trim().length === 0) {
    issues.push({ field: 'title', section: 'Product Info', severity: 'error', message: 'Product title is required.' });
  } else if (product.title.trim().length < 10) {
    issues.push({ field: 'title', section: 'Product Info', severity: 'warning', message: 'Product title should be at least 10 characters for better SEO.' });
  }

  if (!product.sku || product.sku.trim().length === 0) {
    issues.push({ field: 'sku', section: 'Product Info', severity: 'error', message: 'Product SKU is required.' });
  }

  if (!product.marketplace) {
    issues.push({ field: 'marketplace', section: 'Product Info', severity: 'error', message: 'Target marketplace selection is required.' });
  }

  if (!product.category) {
    issues.push({ field: 'category', section: 'Product Info', severity: 'error', message: 'Product category is required.' });
  }

  if (!product.brand) {
    issues.push({ field: 'brand', section: 'Product Info', severity: 'error', message: 'Brand name is required.' });
  }

  if (product.sellingPrice === undefined || product.sellingPrice === null || Number(product.sellingPrice) <= 0) {
    issues.push({ field: 'sellingPrice', section: 'Pricing', severity: 'error', message: 'Selling price must be greater than zero.' });
  }

  if (product.mrp === undefined || product.mrp === null || Number(product.mrp) <= 0) {
    issues.push({ field: 'mrp', section: 'Pricing', severity: 'error', message: 'MRP must be provided.' });
  } else if (product.sellingPrice && Number(product.mrp) < Number(product.sellingPrice)) {
    issues.push({ field: 'mrp', section: 'Pricing', severity: 'error', message: 'MRP cannot be lower than the selling price.' });
  }

  if (!product.hsnCode || String(product.hsnCode).trim().length < 4) {
    issues.push({ field: 'hsnCode', section: 'Pricing', severity: 'error', message: 'Valid HSN code (at least 4 digits) is required for GST compliance.' });
  }

  if (!product.description || product.description.trim().length < 20) {
    issues.push({ field: 'description', section: 'Product Info', severity: 'warning', message: 'A detailed description (at least 20 characters) increases customer trust.' });
  }

  if (!product.images || product.images.length === 0) {
    issues.push({ field: 'images', section: 'Images', severity: 'error', message: 'At least 1 product image is required for marketplace publication.' });
  } else if (product.images.length < 2) {
    issues.push({ field: 'images', section: 'Images', severity: 'warning', message: 'Adding at least 2 images improves customer conversion.' });
  }

  if (product.attributes && Array.isArray(product.attributes)) {
    for (const attr of product.attributes) {
      if (attr.isRequired && (attr.value === undefined || attr.value === null || attr.value === '')) {
        issues.push({
          field: `attr-${attr.key}`,
          section: 'Platform Attributes',
          severity: 'error',
          message: `Required attribute "${attr.label}" is missing a value.`,
        });
      }
    }
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const validCount = Math.max(0, 15 - errorCount - warningCount);
  const isValid = errorCount === 0;

  return {
    isValid,
    validCount,
    warningCount,
    errorCount,
    issues,
  };
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'listivo_salt_2026').digest('hex');
}

function getAuthUser(req: express.Request): DBUser | null {
  const authHeader = req.headers.authorization || '';
  let token = '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (authHeader) {
    token = authHeader.trim();
  }

  if (token) {
    const user = db.users.find((u) => token.includes(u.id) || u.id === token);
    if (user) return user;
  }

  const xUserId = req.headers['x-user-id'];
  if (xUserId) {
    const user = db.users.find((u) => u.id === String(xUserId));
    if (user) return user;
  }

  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // -------------------------------------------------------------
  // API ROUTES
  // -------------------------------------------------------------

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Listivo API',
      version: '1.0.0-phase1',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    });
  });

  // Auth: Current User Profile
  app.get('/api/auth/me', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized. Please log in.' });
    }

    const profile = db.profiles.find((p) => p.userId === user.id);
    const profileComplete = Boolean(
      profile?.profileComplete || (profile?.companyName && profile?.phone && profile?.pickupPincode)
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
        isOwner: user.isOwner,
        fullName: profile?.fullName || user.email.split('@')[0],
        companyName: profile?.companyName || '',
        phone: profile?.phone || '',
        gstin: profile?.gstin || '',
        pickupAddress: profile?.pickupAddress || '',
        pickupPincode: profile?.pickupPincode || '',
        profileComplete,
        avatarUrl: profile?.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  });

  // Auth: Update Profile
  app.put('/api/auth/profile', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized. Please log in.' });
    }

    let profile = db.profiles.find((p) => p.userId === user.id);

    if (!profile) {
      profile = {
        id: `prof-${Date.now()}`,
        userId: user.id,
        fullName: user.email.split('@')[0],
        companyName: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.profiles.push(profile);
    }

    const { fullName, companyName, phone, gstin, pickupAddress, pickupPincode } = req.body;

    if (fullName !== undefined) profile.fullName = String(fullName).trim();
    if (companyName !== undefined) profile.companyName = String(companyName).trim();
    if (phone !== undefined) profile.phone = String(phone).trim();
    if (gstin !== undefined) profile.gstin = String(gstin).trim();
    if (pickupAddress !== undefined) profile.pickupAddress = String(pickupAddress).trim();
    if (pickupPincode !== undefined) profile.pickupPincode = String(pickupPincode).trim();

    const profileComplete = Boolean(
      profile.profileComplete || (profile.companyName && profile.phone && profile.pickupPincode)
    );
    profile.profileComplete = profileComplete;
    profile.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
        isOwner: user.isOwner,
        fullName: profile.fullName,
        companyName: profile.companyName,
        phone: profile.phone,
        gstin: profile.gstin,
        pickupAddress: profile.pickupAddress,
        pickupPincode: profile.pickupPincode,
        profileComplete,
        avatarUrl: profile.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  });

  // Auth: Onboarding (Complete Seller Profile)
  app.post('/api/auth/onboarding', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized. Please log in.' });
    }

    let profile = db.profiles.find((p) => p.userId === user.id);
    if (!profile) {
      profile = {
        id: `prof-${Date.now()}`,
        userId: user.id,
        fullName: user.email.split('@')[0],
        companyName: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.profiles.push(profile);
    }

    const { fullName, companyName, phone, gstin, pickupPincode, pickupAddress } = req.body;

    if (fullName) profile.fullName = String(fullName).trim();
    if (companyName) profile.companyName = String(companyName).trim();
    if (phone) profile.phone = String(phone).trim();
    if (gstin !== undefined) profile.gstin = String(gstin).trim();
    if (pickupPincode) profile.pickupPincode = String(pickupPincode).trim();
    if (pickupAddress) profile.pickupAddress = String(pickupAddress).trim();

    profile.profileComplete = true;
    profile.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Seller onboarding completed successfully.',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
        isOwner: user.isOwner,
        fullName: profile.fullName,
        companyName: profile.companyName,
        phone: profile.phone,
        gstin: profile.gstin,
        pickupAddress: profile.pickupAddress,
        pickupPincode: profile.pickupPincode,
        profileComplete: true,
        avatarUrl: profile.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  });

  // Auth: Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const isOwner = normalizedEmail === OWNER_EMAIL.toLowerCase();

    let user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password. If you do not have an account, please sign up.' });
    }

    // Verify password if provided
    if (password) {
      const hashed = hashPassword(password);
      if (
        user.passwordHash &&
        user.passwordHash !== hashed &&
        user.passwordHash !== 'owner_secure_hash' &&
        user.passwordHash !== 'seller_secure_hash' &&
        user.passwordHash !== 'hash_secret'
      ) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }
    }

    const profile = db.profiles.find((p) => p.userId === user.id);
    const profileComplete = Boolean(
      profile?.profileComplete || (profile?.companyName && profile?.phone && profile?.pickupPincode)
    );

    const token = `listivo-token-${user.id}-${Date.now()}`;

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
        isOwner: user.isOwner,
        fullName: profile?.fullName || user.email.split('@')[0],
        companyName: profile?.companyName || '',
        phone: profile?.phone || '',
        gstin: profile?.gstin || '',
        pickupAddress: profile?.pickupAddress || '',
        pickupPincode: profile?.pickupPincode || '',
        profileComplete,
        avatarUrl: profile?.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  });

  // Auth: Signup
  app.post('/api/auth/signup', (req, res) => {
    const { email, password, fullName, companyName } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, error: 'Full Name is required.' });
    }

    if (password && password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const isOwner = normalizedEmail === OWNER_EMAIL.toLowerCase();

    const existing = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists. Please sign in instead.' });
    }

    const newUserId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const hashedPassword = password ? hashPassword(password) : 'hash_secret';

    const newUser: DBUser = {
      id: newUserId,
      email: normalizedEmail,
      passwordHash: hashedPassword,
      role: isOwner ? 'owner' : 'user',
      plan: isOwner ? 'lifetime_free' : 'free',
      subscriptionStatus: 'active',
      isOwner,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newProfile: DBProfile = {
      id: `prof-${Date.now()}`,
      userId: newUser.id,
      fullName: fullName.trim(),
      companyName: (companyName || '').trim(),
      profileComplete: false, // New seller must complete onboarding!
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    db.profiles.push(newProfile);

    const token = `listivo-token-${newUser.id}-${Date.now()}`;

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        plan: newUser.plan,
        subscriptionStatus: newUser.subscriptionStatus,
        isOwner: newUser.isOwner,
        fullName: newProfile.fullName,
        companyName: newProfile.companyName,
        phone: '',
        gstin: '',
        pickupAddress: '',
        pickupPincode: '',
        profileComplete: false,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
    });
  });

  // Permission Check API
  app.get('/api/permissions', (req, res) => {
    const feature = req.query.feature as string;
    const role = (req.query.role as string) || 'user';
    const plan = (req.query.plan as string) || 'free';
    const isOwner = role === 'owner' || plan === 'lifetime_free';

    res.json({
      feature,
      isOwnerOverride: isOwner,
      allowed: isOwner || ['templates', 'products', 'tutorials', 'settings'].includes(feature),
    });
  });

  // Templates API - GET All with Search, Filtering & Sorting
  app.get('/api/templates', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized. Please log in.' });
    }
    const { search, category, platform, sort } = req.query;

    let result = db.templates.filter((t) => t.userId === user.id || (user.isOwner && (!t.userId || t.userId === 'owner-uuid-1000-8000-000000000001')));

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.subCategory && t.subCategory.toLowerCase().includes(q)) ||
          t.brand.toLowerCase().includes(q) ||
          t.skuPrefix.toLowerCase().includes(q)
      );
    }

    if (category && typeof category === 'string' && category !== 'ALL') {
      result = result.filter((t) => t.category.toLowerCase() === category.toLowerCase());
    }

    if (platform && typeof platform === 'string' && platform !== 'ALL') {
      result = result.filter((t) => t.marketplace.toLowerCase() === platform.toLowerCase());
    }

    // Sort
    if (sort === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'category') {
      result.sort((a, b) => a.category.localeCompare(b.category));
    } else {
      // Default: recently updated
      result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    res.json({
      success: true,
      count: result.length,
      total: result.length,
      data: result,
    });
  });

  // Templates API - GET Single
  app.get('/api/templates/:id', (req, res) => {
    const user = getAuthUser(req);
    const template = db.templates.find((t) => t.id === req.params.id && (t.userId === user.id || user.isOwner));
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found or access denied.' });
    }
    res.json({ success: true, data: template });
  });

  // Templates API - POST Create
  app.post('/api/templates', (req, res) => {
    const user = getAuthUser(req);
    const body = req.body;

    if (!body.name || !body.name.trim()) {
      return res.status(400).json({ success: false, error: 'Template Name is required.' });
    }
    if (!body.category || !body.category.trim()) {
      return res.status(400).json({ success: false, error: 'Category is required.' });
    }
    if (!body.marketplace || !body.marketplace.trim()) {
      return res.status(400).json({ success: false, error: 'Platform / Marketplace is required.' });
    }

    const newTemplate = {
      id: `tpl-${Date.now()}`,
      userId: user.id,
      name: body.name.trim(),
      marketplace: body.marketplace || 'meesho',
      category: body.category.trim(),
      subCategory: body.subCategory || '',
      brand: body.brand || '',
      productType: body.productType || '',
      material: body.material || '',
      color: body.color || '',
      pattern: body.pattern || '',
      description: body.description || '',
      keyFeatures: Array.isArray(body.keyFeatures) ? body.keyFeatures : [],
      gstRate: Number(body.gstRate) || 5,
      hsnCode: body.hsnCode || '6204',
      weightGrams: Number(body.weightGrams) || 250,
      lengthCm: Number(body.lengthCm) || 20,
      widthCm: Number(body.widthCm) || 15,
      heightCm: Number(body.heightCm) || 5,
      defaultPrice: Number(body.defaultPrice) || 499,
      mrp: Number(body.mrp) || 999,
      discountPercent: Number(body.discountPercent) || 50,
      returnPolicy: body.returnPolicy || '7 Days Easy Return',
      careInstructions: body.careInstructions || 'Hand Wash Cold',
      skuPrefix: body.skuPrefix || 'SKU-TPL',
      tags: Array.isArray(body.tags) ? body.tags : [],
      images: Array.isArray(body.images) ? body.images : [],
      primaryImageIndex: Number(body.primaryImageIndex) || 0,
      attributes: Array.isArray(body.attributes) ? body.attributes : [],
      variantDimensions: Array.isArray(body.variantDimensions) ? body.variantDimensions : [],
      platformMappings: body.platformMappings || {},
      listingsCount: 0,
      status: 'ACTIVE' as const,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.templates.unshift(newTemplate);

    // Log Activity
    db.activities.unshift({
      id: `act-${Date.now()}`,
      userId: newTemplate.userId,
      activityType: 'template_created',
      title: `Created Template: ${newTemplate.name}`,
      description: `Category "${newTemplate.category}" on ${newTemplate.marketplace.toUpperCase()}`,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Template created successfully.',
      data: newTemplate,
    });
  });

  // Templates API - PUT Update
  app.put('/api/templates/:id', (req, res) => {
    const user = getAuthUser(req);
    const index = db.templates.findIndex((t) => t.id === req.params.id && (t.userId === user.id || user.isOwner));
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Template not found or access denied.' });
    }

    const body = req.body;
    if (body.name !== undefined && !body.name.trim()) {
      return res.status(400).json({ success: false, error: 'Template Name cannot be empty.' });
    }

    const updatedTemplate = {
      ...db.templates[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    db.templates[index] = updatedTemplate;

    res.json({
      success: true,
      message: 'Template updated successfully.',
      data: updatedTemplate,
    });
  });

  // Templates API - DELETE
  app.delete('/api/templates/:id', (req, res) => {
    const user = getAuthUser(req);
    const index = db.templates.findIndex((t) => t.id === req.params.id && (t.userId === user.id || user.isOwner));
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Template not found or access denied.' });
    }

    const deleted = db.templates.splice(index, 1)[0];

    res.json({
      success: true,
      message: `Template "${deleted.name}" deleted successfully.`,
      data: { id: req.params.id },
    });
  });

  // Templates API - POST Duplicate
  app.post('/api/templates/:id/duplicate', (req, res) => {
    const user = getAuthUser(req);
    const original = db.templates.find((t) => t.id === req.params.id && (t.userId === user.id || user.isOwner));
    if (!original) {
      return res.status(404).json({ success: false, error: 'Template not found or access denied.' });
    }

    const duplicated: typeof original = {
      ...JSON.parse(JSON.stringify(original)),
      id: `tpl-${Date.now()}`,
      userId: user.id,
      name: `${original.name} (Copy)`,
      isDefault: false,
      listingsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.templates.unshift(duplicated);

    db.activities.unshift({
      id: `act-${Date.now()}`,
      userId: duplicated.userId,
      activityType: 'template_created',
      title: `Duplicated Template: ${duplicated.name}`,
      description: `Copied configuration from ${original.name}`,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: `Template duplicated as "${duplicated.name}".`,
      data: duplicated,
    });
  });

  // Templates API - POST Create Listing from Template
  app.post('/api/templates/:id/create-listing', (req, res) => {
    const user = getAuthUser(req);
    const template = db.templates.find((t) => t.id === req.params.id && (t.userId === user.id || user.isOwner));
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found or access denied.' });
    }

    const templateImages = (template.images || []).map((url, idx) => ({
      id: `img-tpl-${Date.now()}-${idx}`,
      url,
      isPrimary: idx === (template.primaryImageIndex || 0),
    }));

    const rawProduct: DBProduct = {
      id: `prod-${Date.now()}`,
      userId: user.id,
      templateId: template.id,
      templateName: template.name,
      title: `${template.brand || 'Brand'} ${template.subCategory || template.category} - ${template.name}`,
      sku: `${template.skuPrefix}-${Math.floor(1000 + Math.random() * 9000)}`,
      styleId: `STYLE-${template.skuPrefix}-${Math.floor(100 + Math.random() * 900)}`,
      marketplace: template.marketplace,
      category: template.category,
      subCategory: template.subCategory,
      brand: template.brand,
      material: template.material,
      description: template.description,
      keyFeatures: template.keyFeatures || [],
      mrp: template.mrp,
      sellingPrice: template.defaultPrice,
      costPrice: Math.round(template.defaultPrice * 0.5),
      discountPercent: template.mrp > 0 ? Math.round(((template.mrp - template.defaultPrice) / template.mrp) * 100) : 0,
      stock: 50,
      gstRate: template.gstRate,
      hsnCode: template.hsnCode,
      weightGrams: template.weightGrams,
      lengthCm: template.lengthCm,
      widthCm: template.widthCm,
      heightCm: template.heightCm,
      returnPolicy: template.returnPolicy,
      careInstructions: template.careInstructions,
      status: 'DRAFT',
      images: templateImages,
      primaryImageIndex: 0,
      attributes: template.attributes || [],
      variantDimensions: template.variantDimensions || [],
      variantsCount: template.variantDimensions && template.variantDimensions.length > 0
        ? template.variantDimensions.reduce((acc, v) => acc * (v.options.length || 1), 1)
        : 1,
      platformMappings: template.platformMappings || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    rawProduct.validationResults = validateProductData(rawProduct);
    db.products.unshift(rawProduct);
    template.listingsCount = (template.listingsCount || 0) + 1;

    db.activities.unshift({
      id: `act-${Date.now()}`,
      userId: user.id,
      activityType: 'listing_created',
      title: `Created Listing from Template: ${template.name}`,
      description: `Draft SKU ${rawProduct.sku} initialized.`,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Listing draft created from template.',
      data: rawProduct,
    });
  });

  // -------------------------------------------------------------
  // PRODUCTS API (FULL CRUD & VALIDATION & AI)
  // -------------------------------------------------------------

  // GET /api/products (with filtering & sorting)
  app.get('/api/products', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized. Please log in.' });
    }
    let results = db.products.filter((p) => p.userId === user.id || (user.isOwner && (!p.userId || p.userId === 'owner-uuid-1000-8000-000000000001')));

    const { search, category, marketplace, status, sort } = req.query;

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
    }

    if (category && typeof category === 'string' && category !== 'all') {
      results = results.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (marketplace && typeof marketplace === 'string' && marketplace !== 'all') {
      results = results.filter((p) => p.marketplace.toLowerCase() === marketplace.toLowerCase());
    }

    if (status && typeof status === 'string' && status !== 'all') {
      results = results.filter((p) => p.status.toLowerCase() === status.toLowerCase());
    }

    if (sort && typeof sort === 'string') {
      if (sort === 'newest') {
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (sort === 'oldest') {
        results.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      } else if (sort === 'price_asc') {
        results.sort((a, b) => a.sellingPrice - b.sellingPrice);
      } else if (sort === 'price_desc') {
        results.sort((a, b) => b.sellingPrice - a.sellingPrice);
      } else if (sort === 'title_asc') {
        results.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sort === 'variants_desc') {
        results.sort((a, b) => (b.variantsCount || 0) - (a.variantsCount || 0));
      }
    } else {
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json({
      success: true,
      data: results,
      total: results.length,
      stats: {
        total: results.length,
        ready: results.filter((p) => p.status === 'READY').length,
        draft: results.filter((p) => p.status === 'DRAFT').length,
        incomplete: results.filter((p) => p.status === 'INCOMPLETE').length,
        exported: results.filter((p) => p.status === 'EXPORTED').length,
      },
    });
  });

  // GET /api/products/:id
  app.get('/api/products/:id', (req, res) => {
    const user = getAuthUser(req);
    const product = db.products.find((p) => p.id === req.params.id && (p.userId === user.id || user.isOwner));
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product listing not found or access denied.' });
    }
    res.json({ success: true, data: product });
  });

  // POST /api/products (Create New Listing)
  app.post('/api/products', (req, res) => {
    const user = getAuthUser(req);
    const data = req.body;
    if (!data.title || !data.sku) {
      return res.status(400).json({ success: false, error: 'Title and SKU are required fields.' });
    }

    const validationResults = validateProductData(data);
    const initialStatus = validationResults.isValid ? 'READY' : 'DRAFT';

    const newProduct: DBProduct = {
      id: `prod-${Date.now()}`,
      userId: user.id,
      templateId: data.templateId || undefined,
      templateName: data.templateName || undefined,
      title: data.title,
      sku: data.sku,
      styleId: data.styleId || `STYLE-${Math.floor(1000 + Math.random() * 9000)}`,
      marketplace: data.marketplace || 'meesho',
      category: data.category || 'General',
      subCategory: data.subCategory || '',
      brand: data.brand || 'Listivo Merchant',
      material: data.material || '',
      description: data.description || '',
      keyFeatures: data.keyFeatures || [],
      mrp: Number(data.mrp) || Number(data.sellingPrice) || 0,
      sellingPrice: Number(data.sellingPrice) || 0,
      costPrice: Number(data.costPrice) || 0,
      discountPercent: Number(data.mrp) > 0 ? Math.round(((Number(data.mrp) - Number(data.sellingPrice)) / Number(data.mrp)) * 100) : 0,
      stock: Number(data.stock) || 0,
      gstRate: Number(data.gstRate) || 5,
      hsnCode: String(data.hsnCode || '6204'),
      weightGrams: Number(data.weightGrams) || 250,
      lengthCm: Number(data.lengthCm) || 20,
      widthCm: Number(data.widthCm) || 15,
      heightCm: Number(data.heightCm) || 5,
      returnPolicy: data.returnPolicy || '7 Days Return',
      careInstructions: data.careInstructions || '',
      status: data.status || initialStatus,
      images: data.images || [],
      primaryImageIndex: data.primaryImageIndex || 0,
      attributes: data.attributes || [],
      variantDimensions: data.variantDimensions || [],
      variants: data.variants || [],
      variantsCount: data.variants && data.variants.length > 0 ? data.variants.length : 1,
      platformMappings: data.platformMappings || {},
      validationResults,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.products.unshift(newProduct);

    db.activities.unshift({
      id: `act-${Date.now()}`,
      userId: newProduct.userId,
      activityType: 'listing_created',
      title: `Created Product Listing: ${newProduct.title}`,
      description: `SKU ${newProduct.sku} created on ${newProduct.marketplace.toUpperCase()}.`,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Product listing created successfully.',
      data: newProduct,
    });
  });

  // PUT /api/products/:id (Update Listing)
  app.put('/api/products/:id', (req, res) => {
    const user = getAuthUser(req);
    const index = db.products.findIndex((p) => p.id === req.params.id && (p.userId === user.id || user.isOwner));
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Product listing not found or access denied.' });
    }

    const updatedData = { ...db.products[index], ...req.body, updatedAt: new Date().toISOString() };
    const validationResults = validateProductData(updatedData);
    updatedData.validationResults = validationResults;

    // Auto update status if currently draft/incomplete
    if (updatedData.status !== 'EXPORTED') {
      if (validationResults.isValid && updatedData.status === 'INCOMPLETE') {
        updatedData.status = 'READY';
      } else if (!validationResults.isValid && updatedData.status === 'READY') {
        updatedData.status = 'INCOMPLETE';
      }
    }

    updatedData.variantsCount = updatedData.variants && updatedData.variants.length > 0 ? updatedData.variants.length : 1;

    db.products[index] = updatedData;

    res.json({
      success: true,
      message: 'Product listing updated successfully.',
      data: updatedData,
    });
  });

  // POST /api/products/:id/duplicate
  app.post('/api/products/:id/duplicate', (req, res) => {
    const user = getAuthUser(req);
    const original = db.products.find((p) => p.id === req.params.id && (p.userId === user.id || user.isOwner));
    if (!original) {
      return res.status(404).json({ success: false, error: 'Product listing not found or access denied.' });
    }

    const duplicatedSKU = `${original.sku}-COPY-${Math.floor(100 + Math.random() * 900)}`;
    const duplicated: DBProduct = {
      ...original,
      id: `prod-${Date.now()}`,
      userId: user.id,
      title: `${original.title} (Copy)`,
      sku: duplicatedSKU,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    duplicated.validationResults = validateProductData(duplicated);
    db.products.unshift(duplicated);

    db.activities.unshift({
      id: `act-${Date.now()}`,
      userId: duplicated.userId,
      activityType: 'listing_created',
      title: `Duplicated Listing: ${original.title}`,
      description: `New draft SKU ${duplicatedSKU} created.`,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: `Listing duplicated as SKU ${duplicatedSKU}.`,
      data: duplicated,
    });
  });

  // POST /api/products/:id/mark-ready
  app.post('/api/products/:id/mark-ready', (req, res) => {
    const user = getAuthUser(req);
    const product = db.products.find((p) => p.id === req.params.id && (p.userId === user.id || user.isOwner));
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product listing not found or access denied.' });
    }

    const validationResults = validateProductData(product);
    product.validationResults = validationResults;

    if (!validationResults.isValid) {
      product.status = 'INCOMPLETE';
      return res.status(400).json({
        success: false,
        error: `Cannot mark as READY. Listing has ${validationResults.errorCount} blocking validation errors.`,
        validationResults,
      });
    }

    product.status = 'READY';
    product.updatedAt = new Date().toISOString();

    db.activities.unshift({
      id: `act-${Date.now()}`,
      userId: user.id,
      activityType: 'listing_ready',
      title: `Listing Ready for Export: ${product.title}`,
      description: `SKU ${product.sku} validated with 0 errors.`,
      createdAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Listing validated and marked as READY.',
      data: product,
    });
  });

  // DELETE /api/products/:id
  app.delete('/api/products/:id', (req, res) => {
    const user = getAuthUser(req);
    const index = db.products.findIndex((p) => p.id === req.params.id && (p.userId === user.id || user.isOwner));
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Product listing not found or access denied.' });
    }

    const deleted = db.products.splice(index, 1)[0];

    db.activities.unshift({
      id: `act-${Date.now()}`,
      userId: user.id,
      activityType: 'listing_deleted',
      title: `Deleted Listing: ${deleted.title}`,
      description: `Removed SKU ${deleted.sku}.`,
      createdAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: `Product listing SKU ${deleted.sku} deleted.`,
    });
  });

  // -------------------------------------------------------------
  // PHASE 6: LISTIVO AI & SMART LISTINGS API ENDPOINTS
  // -------------------------------------------------------------

  // GET /api/ai/usage - Get current usage & entitlement status
  app.get('/api/ai/usage', (req, res) => {
    const user = getAuthUser(req);
    const summary = getUserUsageSummary(user);
    res.json({ success: true, data: summary });
  });

  // POST /api/ai/title - Generate Title
  app.post('/api/ai/title', async (req, res) => {
    try {
      const user = getAuthUser(req);
      const summary = getUserUsageSummary(user);
      if (!summary.canRequest) {
        return res.status(429).json({ success: false, error: summary.reason });
      }

      const result = await generateAITitle(req.body, user.id);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Title generation failed.' });
    }
  });

  // POST /api/ai/description - Generate Description & Key Features
  app.post('/api/ai/description', async (req, res) => {
    try {
      const user = getAuthUser(req);
      const summary = getUserUsageSummary(user);
      if (!summary.canRequest) {
        return res.status(429).json({ success: false, error: summary.reason });
      }

      const result = await generateAIDescription(req.body, user.id);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Description generation failed.' });
    }
  });

  // POST /api/ai/generate-description (Backward Compatibility alias)
  app.post('/api/ai/generate-description', async (req, res) => {
    try {
      const user = getAuthUser(req);
      const result = await generateAIDescription(req.body, user.id);
      res.json({
        success: true,
        source: result.source,
        data: {
          description: result.description,
          keyFeatures: result.keyFeatures,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Description generation failed.' });
    }
  });

  // POST /api/ai/bullets - Generate Bullet Points
  app.post('/api/ai/bullets', async (req, res) => {
    try {
      const user = getAuthUser(req);
      const result = await generateAIBullets(req.body, user.id);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Bullets generation failed.' });
    }
  });

  // POST /api/ai/keywords - Generate Keywords
  app.post('/api/ai/keywords', async (req, res) => {
    try {
      const result = await generateAIKeywords(req.body);
      res.json({ success: true, data: result.data, source: result.source });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Keywords generation failed.' });
    }
  });

  // -------------------------------------------------------------
  // PHASE 7C: KEYWORD & SEO INTELLIGENCE API ROUTES
  // -------------------------------------------------------------

  // POST /api/keywords/research - Research categorized AI listing keywords
  app.post('/api/keywords/research', async (req, res) => {
    try {
      const user = getAuthUser(req);
      const { productName, category, description, material, color, size, targetCustomer, marketplace, language, customInstructions } = req.body;
      if (!productName || !String(productName).trim()) {
        return res.status(400).json({ success: false, error: 'Product name is required for keyword research.' });
      }

      const summary = getUserUsageSummary(user);
      if (!summary.canRequest) {
        return res.status(429).json({ success: false, error: summary.reason });
      }

      const result = await researchAIKeywords({
        productName,
        category,
        description,
        material,
        color,
        size,
        targetCustomer,
        marketplace: marketplace || 'meesho',
        language: language || 'English',
        customInstructions,
      });

      res.json({ success: true, data: result.data, source: result.source });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Keyword research failed.' });
    }
  });

  // GET /api/keywords/sets - List user saved keyword sets
  app.get('/api/keywords/sets', (req, res) => {
    const user = getAuthUser(req);
    const userSets = db.keywordSets.filter((s) => s.userId === user.id || (user.isOwner && !s.userId));
    res.json({ success: true, count: userSets.length, data: userSets });
  });

  // POST /api/keywords/sets - Create saved keyword set
  app.post('/api/keywords/sets', (req, res) => {
    const user = getAuthUser(req);
    const { name, marketplace, category, keywords, notes } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, error: 'Keyword set name is required.' });
    }

    const newSet: DBKeywordSet = {
      id: `kwset-${Date.now()}`,
      userId: user.id,
      name: name.trim(),
      marketplace: marketplace || 'meesho',
      category: category || 'General',
      keywords: Array.isArray(keywords) ? keywords : [],
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.keywordSets.unshift(newSet);
    res.status(201).json({ success: true, message: `Keyword set "${newSet.name}" saved.`, data: newSet });
  });

  // GET /api/keywords/sets/:id - Get single set
  app.get('/api/keywords/sets/:id', (req, res) => {
    const user = getAuthUser(req);
    const set = db.keywordSets.find((s) => s.id === req.params.id && (s.userId === user.id || user.isOwner));
    if (!set) {
      return res.status(404).json({ success: false, error: 'Keyword set not found or access denied.' });
    }
    res.json({ success: true, data: set });
  });

  // PUT /api/keywords/sets/:id - Update keyword set
  app.put('/api/keywords/sets/:id', (req, res) => {
    const user = getAuthUser(req);
    const set = db.keywordSets.find((s) => s.id === req.params.id && (s.userId === user.id || user.isOwner));
    if (!set) {
      return res.status(404).json({ success: false, error: 'Keyword set not found or access denied.' });
    }

    const { name, marketplace, category, keywords, notes } = req.body;
    if (name) set.name = String(name).trim();
    if (marketplace) set.marketplace = marketplace;
    if (category) set.category = category;
    if (Array.isArray(keywords)) set.keywords = keywords;
    if (notes !== undefined) set.notes = notes;
    set.updatedAt = new Date().toISOString();

    res.json({ success: true, message: `Keyword set "${set.name}" updated.`, data: set });
  });

  // DELETE /api/keywords/sets/:id - Delete keyword set
  app.delete('/api/keywords/sets/:id', (req, res) => {
    const user = getAuthUser(req);
    const index = db.keywordSets.findIndex((s) => s.id === req.params.id && (s.userId === user.id || user.isOwner));
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Keyword set not found or access denied.' });
    }

    const deleted = db.keywordSets.splice(index, 1)[0];
    res.json({ success: true, message: `Keyword set "${deleted.name}" deleted.` });
  });

  // POST /api/keywords/analyze - Quality Analysis
  app.post('/api/keywords/analyze', (req, res) => {
    const { keywords, contextText } = req.body;
    if (!Array.isArray(keywords)) {
      return res.status(400).json({ success: false, error: 'Keywords array required.' });
    }

    const analysis = analyzeKeywordsQuality(keywords, contextText);
    res.json({ success: true, data: analysis });
  });

  // POST /api/keywords/optimize-title - Title Generator with selected keywords
  app.post('/api/keywords/optimize-title', async (req, res) => {
    try {
      const { keywords, productName, marketplace, brand, material, color } = req.body;
      if (!productName) {
        return res.status(400).json({ success: false, error: 'Product name required for title generation.' });
      }

      const result = await optimizeTitleWithKeywords({
        keywords: Array.isArray(keywords) ? keywords : [],
        productName,
        marketplace,
        brand,
        material,
        color,
      });

      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Title optimization failed.' });
    }
  });

  // POST /api/keywords/optimize-description - Description Optimizer
  app.post('/api/keywords/optimize-description', async (req, res) => {
    try {
      const { originalDescription, keywords, marketplace, material, color, productName } = req.body;

      const result = await optimizeDescriptionWithKeywords({
        originalDescription: originalDescription || '',
        keywords: Array.isArray(keywords) ? keywords : [],
        marketplace,
        material,
        color,
        productName,
      });

      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Description optimization failed.' });
    }
  });

  // POST /api/ai/attributes - Auto-Infer Attributes
  app.post('/api/ai/attributes', async (req, res) => {
    try {
      const user = getAuthUser(req);
      const result = await generateAIAttributes(req.body, user.id);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Attributes inference failed.' });
    }
  });

  // POST /api/ai/refine - Refine/Edit Content
  app.post('/api/ai/refine', async (req, res) => {
    try {
      const user = getAuthUser(req);
      const { text, instruction, ...ctx } = req.body;
      const result = await refineAIText(text || '', instruction || 'Improve tone and SEO', ctx, user.id);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Text refinement failed.' });
    }
  });

  // POST /api/ai/quality-score - Quality Analysis
  app.post('/api/ai/quality-score', async (req, res) => {
    try {
      const user = getAuthUser(req);
      const result = await analyzeAIQuality(req.body, user.id);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Quality score calculation failed.' });
    }
  });

  // POST /api/ai/smart-listing/generate - Generate Complete Smart Listing
  app.post('/api/ai/smart-listing/generate', async (req, res) => {
    try {
      const user = getAuthUser(req);
      const { rawText, marketplace, brand } = req.body;
      if (!rawText || !rawText.trim()) {
        return res.status(400).json({ success: false, error: 'Raw text or product details are required.' });
      }

      const summary = getUserUsageSummary(user);
      if (!summary.canRequest) {
        return res.status(429).json({ success: false, error: summary.reason });
      }

      const generated = await createSmartListing(rawText, marketplace || 'meesho', brand || '', user.id);
      res.json({ success: true, data: generated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Smart listing generation failed.' });
    }
  });

  // GET /api/ai/smart-listing - Get saved smart listing drafts
  app.get('/api/ai/smart-listing', (req, res) => {
    const user = getAuthUser(req);
    const drafts = db.smartListings.filter((s) => s.userId === user.id || (user.isOwner && !s.userId));
    res.json({ success: true, count: drafts.length, data: drafts });
  });

  // POST /api/ai/smart-listing/save - Save draft smart listing
  app.post('/api/ai/smart-listing/save', (req, res) => {
    const user = getAuthUser(req);
    const draftData = req.body;
    const newDraft: DBSmartListingDraft = {
      id: `smart-${Date.now()}`,
      userId: user.id,
      title: draftData.title || 'Untitled Smart Listing',
      sku: draftData.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      marketplace: draftData.marketplace || 'meesho',
      category: draftData.category || 'General',
      brand: draftData.brand || 'Generic',
      rawInput: draftData.rawInput || '',
      generatedTitle: draftData.title || '',
      generatedDescription: draftData.description || '',
      generatedBullets: draftData.keyFeatures || [],
      generatedKeywords: draftData.keywords || { primary: [], secondary: [], longTail: [], related: [] },
      generatedAttributes: draftData.attributes || [],
      qualityScore: draftData.qualityScore || {
        overall: 85,
        titleScore: 85,
        descriptionScore: 85,
        keywordScore: 85,
        attributeScore: 85,
        complianceScore: 90,
        suggestions: [],
      },
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.smartListings.unshift(newDraft);

    res.status(201).json({
      success: true,
      message: 'Smart Listing draft saved.',
      data: newDraft,
    });
  });

  // POST /api/ai/bulk-jobs - Create Bulk AI Generation Job
  app.post('/api/ai/bulk-jobs', async (req, res) => {
    const user = getAuthUser(req);
    const { jobType, marketplace, items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Items array is required for bulk AI job.' });
    }

    const newJob: DBAIJob = {
      id: `aijob-${Date.now()}`,
      userId: user.id,
      jobType: jobType || 'bulk_listing_generate',
      marketplace: marketplace || 'meesho',
      status: 'PROCESSING',
      totalItems: items.length,
      completedItems: 0,
      failedItems: 0,
      items: items.map((item: any, idx: number) => ({
        id: `item-${idx}`,
        productId: item.productId || item.sku,
        title: item.title || item.rawText || `Row ${idx + 1}`,
        status: 'PENDING',
      })),
      createdAt: new Date().toISOString(),
    };

    db.aiJobs.unshift(newJob);

    // Process job items synchronously/progressively for responsive demo
    for (let i = 0; i < newJob.items.length; i++) {
      const item = newJob.items[i];
      const sourceInput = items[i];

      try {
        let aiResult: any = null;
        if (jobType === 'title_batch') {
          aiResult = await generateAITitle({ title: sourceInput.title, brand: sourceInput.brand, category: sourceInput.category, marketplace: newJob.marketplace });
        } else if (jobType === 'description_batch') {
          aiResult = await generateAIDescription({ title: sourceInput.title, brand: sourceInput.brand, category: sourceInput.category, material: sourceInput.material });
        } else {
          aiResult = await createSmartListing(sourceInput.title || sourceInput.rawText || 'Product', newJob.marketplace, sourceInput.brand);
        }

        item.status = 'SUCCESS';
        item.result = aiResult;
        newJob.completedItems++;
      } catch (err: any) {
        item.status = 'FAILED';
        item.error = err.message || 'Generation failed';
        newJob.failedItems++;
      }
    }

    newJob.status = newJob.failedItems === 0 ? 'COMPLETED' : 'COMPLETED';
    newJob.completedAt = new Date().toISOString();

    db.activities.unshift({
      id: `act-${Date.now()}`,
      userId: newJob.userId,
      activityType: 'bulk_ai_job',
      title: `Bulk AI Job Completed: ${newJob.jobType}`,
      description: `Generated AI content for ${newJob.completedItems}/${newJob.totalItems} rows.`,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Bulk AI Job completed.',
      data: newJob,
    });
  });

  // GET /api/ai/bulk-jobs - List AI Jobs
  app.get('/api/ai/bulk-jobs', (req, res) => {
    const user = getAuthUser(req);
    const jobs = db.aiJobs.filter((j) => j.userId === user.id || (user.isOwner && !j.userId));
    res.json({ success: true, count: jobs.length, data: jobs });
  });

  // GET /api/ai/bulk-jobs/:id - Get Job Status
  app.get('/api/ai/bulk-jobs/:id', (req, res) => {
    const user = getAuthUser(req);
    const job = db.aiJobs.find((j) => j.id === req.params.id && (j.userId === user.id || user.isOwner));
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found or access denied.' });
    }
    res.json({ success: true, data: job });
  });

  // POST /api/ai/versions - Save Generation Version History
  app.post('/api/ai/versions', (req, res) => {
    const { productId, feature, previousValue, generatedValue, promptUsed, qualityScore } = req.body;

    const version: DBAIGenerationVersion = {
      id: `ver-${Date.now()}`,
      productId: productId || undefined,
      feature: feature || 'title',
      previousValue,
      generatedValue,
      promptUsed,
      qualityScore,
      createdAt: new Date().toISOString(),
    };

    db.aiVersions.unshift(version);
    res.status(201).json({ success: true, data: version });
  });

  // GET /api/ai/versions/:productId - Get Version History
  app.get('/api/ai/versions/:productId', (req, res) => {
    const versions = db.aiVersions.filter((v) => v.productId === req.params.productId);
    res.json({ success: true, count: versions.length, data: versions });
  });

  // Activities API
  app.get('/api/activities', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized. Please log in.' });
    }
    const userActivities = db.activities.filter((a) => a.userId === user.id || (user.isOwner && (!a.userId || a.userId === 'owner-uuid-1000-8000-000000000001')));
    res.json({ success: true, data: userActivities });
  });

  // Extension Status Handshake API
  app.get('/api/extension/status', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.json({
        success: true,
        extensionConnected: false,
        status: 'NOT_CONNECTED',
        message: 'LISTIVO Chrome Extension is not connected. Please log in.',
        supportedMarketplaces: ['meesho', 'flipkart', 'amazon', 'myntra'],
        currentOwnerEmail: OWNER_EMAIL,
        serverTime: new Date().toISOString(),
      });
    }

    const profile = db.profiles.find((p) => p.userId === user.id);
    res.json({
      success: true,
      extensionConnected: true,
      status: 'CONNECTED',
      message: 'LISTIVO Chrome Extension connected successfully.',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan,
        isOwner: user.isOwner,
        fullName: profile?.fullName || user.email.split('@')[0],
        companyName: profile?.companyName || 'Store Panel',
        phone: profile?.phone || '',
        gstin: profile?.gstin || '',
        pickupPincode: profile?.pickupPincode || '',
        profileComplete: Boolean(profile?.profileComplete || (profile?.companyName && profile?.phone)),
      },
      supportedMarketplaces: ['meesho', 'flipkart', 'amazon', 'myntra'],
      serverTime: new Date().toISOString(),
    });
  });

  // GET /api/extension/me - Authenticated Seller Profile
  app.get('/api/extension/me', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized. Please log in.' });
    }

    const profile = db.profiles.find((p) => p.userId === user.id);
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan,
        isOwner: user.isOwner,
        fullName: profile?.fullName || user.email.split('@')[0],
        companyName: profile?.companyName || 'Store Panel',
        phone: profile?.phone || '',
        gstin: profile?.gstin || '',
        pickupAddress: profile?.pickupAddress || '',
        pickupPincode: profile?.pickupPincode || '',
        profileComplete: Boolean(profile?.profileComplete || (profile?.companyName && profile?.phone)),
      },
    });
  });

  // GET /api/extension/templates - Seller Templates for Extension
  app.get('/api/extension/templates', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized. Please log in.' });
    }

    const templates = db.templates.filter(
      (t) => t.userId === user.id || (user.isOwner && (!t.userId || t.userId === 'owner-uuid-1000-8000-000000000001'))
    );

    const lightweightDTOs = templates.map((t) => ({
      id: t.id,
      name: t.name,
      marketplace: t.marketplace,
      category: t.category,
      subCategory: t.subCategory,
      brand: t.brand,
      material: t.material,
      color: t.color,
      pattern: t.pattern,
      description: t.description,
      keyFeatures: t.keyFeatures || [],
      gstRate: t.gstRate,
      hsnCode: t.hsnCode,
      defaultPrice: t.defaultPrice,
      mrp: t.mrp,
      discountPercent: t.discountPercent,
      skuPrefix: t.skuPrefix,
      images: t.images || [],
      primaryImageIndex: t.primaryImageIndex || 0,
      attributes: t.attributes || [],
      variantDimensions: t.variantDimensions || [],
      status: t.status,
      updatedAt: t.updatedAt,
    }));

    res.json({
      success: true,
      count: lightweightDTOs.length,
      data: lightweightDTOs,
    });
  });

  // GET /api/extension/templates/:id - Single Template Detail for Extension
  app.get('/api/extension/templates/:id', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized. Please log in.' });
    }

    const template = db.templates.find(
      (t) => t.id === req.params.id && (t.userId === user.id || user.isOwner)
    );

    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found or access denied.' });
    }

    res.json({
      success: true,
      data: template,
    });
  });

  // GET /api/extension/listings - Seller Product Listings for Extension
  app.get('/api/extension/listings', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized. Please log in.' });
    }

    const products = db.products.filter(
      (p) => p.userId === user.id || (user.isOwner && (!p.userId || p.userId === 'owner-uuid-1000-8000-000000000001'))
    );

    const lightweightListings = products.map((p) => ({
      id: p.id,
      templateId: p.templateId,
      templateName: p.templateName,
      title: p.title,
      sku: p.sku,
      styleId: p.styleId,
      marketplace: p.marketplace,
      category: p.category,
      subCategory: p.subCategory,
      brand: p.brand,
      material: p.material,
      description: p.description,
      keyFeatures: p.keyFeatures || [],
      mrp: p.mrp,
      sellingPrice: p.sellingPrice,
      stock: p.stock,
      gstRate: p.gstRate,
      hsnCode: p.hsnCode,
      status: p.status,
      images: p.images || [],
      attributes: p.attributes || [],
      variantsCount: p.variantsCount || 1,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    res.json({
      success: true,
      count: lightweightListings.length,
      data: lightweightListings,
    });
  });

  // POST /api/extension/activity - Record extension autofill activity event
  app.post('/api/extension/activity', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized. Please log in.' });
    }

    const { type, title, description, marketplace, fieldsCount } = req.body || {};
    const newActivity = {
      id: `act-ext-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: user.id,
      userEmail: user.email,
      userName: user.email.split('@')[0],
      type: type || 'EXTENSION_AUTOFILL',
      activityType: type || 'EXTENSION_AUTOFILL',
      title: title || 'Meesho Autofill Completed',
      description: description || `Autofilled ${fieldsCount || 'multiple'} listing fields via LISTIVO Extension`,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      marketplace: marketplace || 'MEESHO',
    };

    db.activities.unshift(newActivity);
    res.json({ success: true, data: newActivity });
  });

  // -------------------------------------------------------------
  // BULK CATALOG / CSV ENGINE API ROUTES
  // -------------------------------------------------------------

  // GET /api/bulk/imports - List import history
  app.get('/api/bulk/imports', (req, res) => {
    const user = getAuthUser(req);
    const userImports = db.bulkImports.filter((imp) => imp.userId === user.id || (user.isOwner && !imp.userId));
    const sorted = [...userImports].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json({
      success: true,
      count: sorted.length,
      data: sorted,
    });
  });

  // GET /api/bulk/imports/:id - Get single import detail
  app.get('/api/bulk/imports/:id', (req, res) => {
    const user = getAuthUser(req);
    const record = db.bulkImports.find((imp) => imp.id === req.params.id && (imp.userId === user.id || user.isOwner));
    if (!record) {
      return res.status(404).json({ success: false, error: 'Bulk import record not found or access denied.' });
    }
    res.json({ success: true, data: record });
  });

  // POST /api/bulk/imports - Create/Start a bulk import job
  app.post('/api/bulk/imports', (req, res) => {
    const user = getAuthUser(req);
    const { fileName, fileSize, marketplace, templateId, templateName, totalRows, validRows, warningRows, errorRows, durationMs, rows } = req.body;

    if (!fileName || totalRows === undefined) {
      return res.status(400).json({ success: false, error: 'fileName and totalRows are required.' });
    }

    const newImport: DBBulkImport = {
      id: `import-${Date.now()}`,
      userId: user.id,
      fileName,
      fileSize: Number(fileSize) || 0,
      marketplace: marketplace || 'meesho',
      templateId,
      templateName,
      totalRows: Number(totalRows) || 0,
      validRows: Number(validRows) || 0,
      warningRows: Number(warningRows) || 0,
      errorRows: Number(errorRows) || 0,
      importedRows: 0,
      skippedRows: 0,
      status: Number(errorRows) > 0 ? 'COMPLETED_WITH_WARNINGS' : 'COMPLETED',
      durationMs: Number(durationMs) || 0,
      rows: Array.isArray(rows) ? rows : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.bulkImports.unshift(newImport);

    db.activities.unshift({
      id: `act-${Date.now()}`,
      userId: user.id,
      activityType: 'bulk_import',
      title: `Bulk Catalog Import: ${newImport.fileName}`,
      description: `Parsed ${newImport.totalRows} rows for ${newImport.marketplace.toUpperCase()} (${newImport.validRows} valid).`,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Bulk import job recorded successfully.',
      data: newImport,
    });
  });

  // PUT /api/bulk/imports/:id - Update bulk import record / rows
  app.put('/api/bulk/imports/:id', (req, res) => {
    const user = getAuthUser(req);
    const index = db.bulkImports.findIndex((imp) => imp.id === req.params.id && (imp.userId === user.id || user.isOwner));
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Bulk import record not found or access denied.' });
    }

    const updated = {
      ...db.bulkImports[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    db.bulkImports[index] = updated;

    res.json({
      success: true,
      message: 'Bulk import updated.',
      data: updated,
    });
  });

  // POST /api/bulk/imports/:id/apply - Commit valid import rows to Product Catalog
  app.post('/api/bulk/imports/:id/apply', (req, res) => {
    const user = getAuthUser(req);
    const record = db.bulkImports.find((imp) => imp.id === req.params.id && (imp.userId === user.id || user.isOwner));
    const { mode, selectedRows } = req.body; // mode: 'create' | 'update' | 'upsert'

    const rowsToApply = Array.isArray(selectedRows) && selectedRows.length > 0
      ? selectedRows
      : (record?.rows || []).filter((r) => r.status !== 'ERROR');

    if (!rowsToApply || rowsToApply.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid rows available to apply to catalog.' });
    }

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const row of rowsToApply) {
      const rowData = row.data || {};
      const sku = (rowData.sku || `SKU-BULK-${Math.floor(1000 + Math.random() * 9000)}`).toString().trim();
      const existingIndex = db.products.findIndex((p) => p.sku.toLowerCase() === sku.toLowerCase() && (p.userId === user.id || user.isOwner));

      if (existingIndex >= 0) {
        if (mode === 'create') {
          skippedCount++;
          continue;
        }
        // Update existing product
        const existing = db.products[existingIndex];
        const updatedProduct: DBProduct = {
          ...existing,
          title: rowData.title || existing.title,
          brand: rowData.brand || existing.brand,
          category: rowData.category || existing.category,
          sellingPrice: Number(rowData.sellingPrice) || existing.sellingPrice,
          mrp: Number(rowData.mrp) || existing.mrp,
          stock: Number(rowData.stock) !== undefined ? Number(rowData.stock) : existing.stock,
          gstRate: Number(rowData.gstRate) || existing.gstRate,
          hsnCode: rowData.hsnCode || existing.hsnCode,
          description: rowData.description || existing.description,
          updatedAt: new Date().toISOString(),
        };
        updatedProduct.validationResults = validateProductData(updatedProduct);
        db.products[existingIndex] = updatedProduct;
        updatedCount++;
      } else {
        if (mode === 'update') {
          skippedCount++;
          continue;
        }
        // Create new product
        const newProduct: DBProduct = {
          id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          userId: user.id,
          templateId: record?.templateId,
          templateName: record?.templateName,
          title: rowData.title || 'Bulk Product',
          sku,
          styleId: rowData.styleId || `STYLE-${sku}`,
          marketplace: record?.marketplace || rowData.marketplace || 'meesho',
          category: rowData.category || 'General',
          subCategory: rowData.subCategory || '',
          brand: rowData.brand || 'Generic',
          material: rowData.material || '',
          description: rowData.description || '',
          keyFeatures: Array.isArray(rowData.keyFeatures) ? rowData.keyFeatures : [],
          mrp: Number(rowData.mrp) || Number(rowData.sellingPrice) || 0,
          sellingPrice: Number(rowData.sellingPrice) || 0,
          costPrice: Number(rowData.costPrice) || Math.round((Number(rowData.sellingPrice) || 0) * 0.5),
          stock: Number(rowData.stock) || 50,
          gstRate: Number(rowData.gstRate) || 5,
          hsnCode: String(rowData.hsnCode || '6204'),
          weightGrams: Number(rowData.weightGrams) || 250,
          lengthCm: Number(rowData.lengthCm) || 20,
          widthCm: Number(rowData.widthCm) || 15,
          heightCm: Number(rowData.heightCm) || 5,
          status: 'READY',
          variantsCount: 1,
          images: rowData.imageUrl1
            ? [{ id: `img-${Date.now()}-1`, url: rowData.imageUrl1, isPrimary: true }]
            : [],
          primaryImageIndex: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        newProduct.validationResults = validateProductData(newProduct);
        db.products.unshift(newProduct);
        createdCount++;
      }
    }

    if (record) {
      record.importedRows = (record.importedRows || 0) + createdCount + updatedCount;
      record.skippedRows = (record.skippedRows || 0) + skippedCount;
      record.status = 'COMPLETED';
      record.updatedAt = new Date().toISOString();
    }

    db.activities.unshift({
      id: `act-${Date.now()}`,
      userId: user.id,
      activityType: 'bulk_apply',
      title: `Applied Bulk Catalog to Products`,
      description: `Created ${createdCount} products, updated ${updatedCount}, skipped ${skippedCount}.`,
      createdAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: `Successfully applied bulk catalog to product listings. (${createdCount} created, ${updatedCount} updated, ${skippedCount} skipped)`,
      stats: { createdCount, updatedCount, skippedCount },
    });
  });

  // POST /api/bulk/imports/:id/cancel
  app.post('/api/bulk/imports/:id/cancel', (req, res) => {
    const user = getAuthUser(req);
    const record = db.bulkImports.find((imp) => imp.id === req.params.id && (imp.userId === user.id || user.isOwner));
    if (!record) {
      return res.status(404).json({ success: false, error: 'Import job not found or access denied.' });
    }
    record.status = 'CANCELLED';
    record.updatedAt = new Date().toISOString();
    res.json({ success: true, message: 'Import job cancelled.', data: record });
  });

  // GET /api/bulk/mapping-presets - Get saved mapping presets
  app.get('/api/bulk/mapping-presets', (req, res) => {
    const user = getAuthUser(req);
    const presets = db.mappingPresets.filter((p) => p.userId === user.id || (user.isOwner && !p.userId));
    res.json({
      success: true,
      count: presets.length,
      data: presets,
    });
  });

  // POST /api/bulk/mapping-presets - Save mapping preset
  app.post('/api/bulk/mapping-presets', (req, res) => {
    const user = getAuthUser(req);
    const { name, marketplace, mappings } = req.body;

    if (!name || !mappings) {
      return res.status(400).json({ success: false, error: 'Preset name and mappings are required.' });
    }

    const newPreset: DBColumnMappingPreset = {
      id: `preset-${Date.now()}`,
      userId: user.id,
      name: name.trim(),
      marketplace: marketplace || 'meesho',
      mappings,
      createdAt: new Date().toISOString(),
    };

    db.mappingPresets.unshift(newPreset);

    res.status(201).json({
      success: true,
      message: `Mapping preset "${newPreset.name}" saved.`,
      data: newPreset,
    });
  });

  // DELETE /api/bulk/mapping-presets/:id
  app.delete('/api/bulk/mapping-presets/:id', (req, res) => {
    const user = getAuthUser(req);
    const index = db.mappingPresets.findIndex((p) => p.id === req.params.id && (p.userId === user.id || user.isOwner));
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Preset not found or access denied.' });
    }
    const deleted = db.mappingPresets.splice(index, 1)[0];
    res.json({ success: true, message: `Preset "${deleted.name}" deleted.`, data: { id: req.params.id } });
  });

  // POST /api/bulk/export - Record export job
  app.post('/api/bulk/export', (req, res) => {
    const user = getAuthUser(req);
    const { fileName, format, marketplace, totalRows } = req.body;

    const newExport: DBBulkExportJob = {
      id: `export-${Date.now()}`,
      userId: user.id,
      fileName: fileName || `Listivo_Export_${marketplace.toUpperCase()}_${Date.now()}.${format || 'csv'}`,
      format: format || 'csv',
      marketplace: marketplace || 'meesho',
      totalRows: Number(totalRows) || 0,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    };

    db.bulkExports.unshift(newExport);

    db.activities.unshift({
      id: `act-${Date.now()}`,
      userId: user.id,
      activityType: 'bulk_export',
      title: `Exported Catalog: ${newExport.fileName}`,
      description: `Exported ${newExport.totalRows} rows formatted for ${newExport.marketplace.toUpperCase()}.`,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Export logged successfully.',
      data: newExport,
    });
  });

  // -------------------------------------------------------------
  // PRICE CALCULATOR & PRICING RULES API
  // -------------------------------------------------------------

  // Helper for Price Calculation Math
  function computePriceDetails(input: {
    productCost: number;
    sellingPrice: number;
    mrp?: number;
    discountPercent?: number;
    gstRate: number;
    packagingCost: number;
    shippingCost: number;
    marketplaceFee: number;
    marketplaceFeePercent: number;
    otherExpenses?: number;
    targetProfitAmount?: number;
    targetProfitMarginPercent?: number;
  }) {
    const productCost = Math.max(0, Number(input.productCost) || 0);
    const sellingPrice = Math.max(0, Number(input.sellingPrice) || 0);
    const mrp = Math.max(sellingPrice, Number(input.mrp) || sellingPrice);
    const discountAmount = Math.max(0, mrp - sellingPrice);
    const discountPercent = mrp > 0 ? (discountAmount / mrp) * 100 : 0;

    const gstRate = Math.max(0, Number(input.gstRate) || 0);
    const packagingCost = Math.max(0, Number(input.packagingCost) || 0);
    const shippingCost = Math.max(0, Number(input.shippingCost) || 0);
    const marketplaceFeeFixed = Math.max(0, Number(input.marketplaceFee) || 0);
    const marketplaceFeePercent = Math.max(0, Number(input.marketplaceFeePercent) || 0);
    const otherExpenses = Math.max(0, Number(input.otherExpenses) || 0);

    const totalMarketplaceFee = marketplaceFeeFixed + (sellingPrice * marketplaceFeePercent) / 100;
    const gstAmount = (sellingPrice * gstRate) / (100 + gstRate);
    const totalCost = productCost + packagingCost + shippingCost + totalMarketplaceFee + otherExpenses;
    const estimatedSettlement = sellingPrice - totalMarketplaceFee - gstAmount;
    const estimatedProfit = sellingPrice - totalCost - gstAmount;
    const profitMarginPercent = sellingPrice > 0 ? (estimatedProfit / sellingPrice) * 100 : 0;

    const fixedExpenses = productCost + packagingCost + shippingCost + otherExpenses + marketplaceFeeFixed;
    const variableRate = (marketplaceFeePercent / 100) + (gstRate / (100 + gstRate));
    const breakEvenSellingPrice = variableRate < 1 ? fixedExpenses / (1 - variableRate) : 0;

    let targetCalculations = null;
    if (input.targetProfitAmount !== undefined || input.targetProfitMarginPercent !== undefined) {
      let reqPrice = 0;
      if (input.targetProfitAmount !== undefined && Number(input.targetProfitAmount) > 0) {
        const targetAmount = Number(input.targetProfitAmount);
        reqPrice = variableRate < 1 ? (fixedExpenses + targetAmount) / (1 - variableRate) : 0;
      } else if (input.targetProfitMarginPercent !== undefined && Number(input.targetProfitMarginPercent) > 0) {
        const targetMarginDec = Number(input.targetProfitMarginPercent) / 100;
        const denom = 1 - variableRate - targetMarginDec;
        reqPrice = denom > 0 ? fixedExpenses / denom : 0;
      }

      if (reqPrice > 0) {
        const diff = reqPrice - sellingPrice;
        const estProfitAtNew = (reqPrice * (1 - variableRate)) - fixedExpenses;
        const estMarginAtNew = reqPrice > 0 ? (estProfitAtNew / reqPrice) * 100 : 0;
        targetCalculations = {
          requiredSellingPrice: Number(reqPrice.toFixed(2)),
          differenceFromCurrent: Number(diff.toFixed(2)),
          estimatedProfitAtNewPrice: Number(estProfitAtNew.toFixed(2)),
          estimatedMargin: Number(estMarginAtNew.toFixed(2)),
        };
      }
    }

    return {
      mrp: Number(mrp.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      discountPercent: Number(discountPercent.toFixed(2)),
      sellingPrice: Number(sellingPrice.toFixed(2)),
      gstRate: Number(gstRate.toFixed(2)),
      gstAmount: Number(gstAmount.toFixed(2)),
      marketplaceFee: Number(totalMarketplaceFee.toFixed(2)),
      packagingCost: Number(packagingCost.toFixed(2)),
      shippingCost: Number(shippingCost.toFixed(2)),
      otherExpenses: Number(otherExpenses.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
      estimatedSettlement: Number(estimatedSettlement.toFixed(2)),
      estimatedProfit: Number(estimatedProfit.toFixed(2)),
      profitMarginPercent: Number(profitMarginPercent.toFixed(2)),
      breakEvenSellingPrice: Number(breakEvenSellingPrice.toFixed(2)),
      isEstimated: true,
      targetCalculations,
    };
  }

  // POST /api/price/calculate - Single Price Calculation
  app.post('/api/price/calculate', (req, res) => {
    const {
      productCost,
      sellingPrice,
      mrp,
      gstRate,
      packagingCost,
      shippingCost,
      marketplaceFee,
      marketplaceFeePercent,
      otherExpenses,
      targetProfitAmount,
      targetProfitMarginPercent,
    } = req.body;

    if (productCost < 0 || sellingPrice < 0) {
      return res.status(400).json({ success: false, error: 'Product cost and selling price cannot be negative.' });
    }

    const details = computePriceDetails({
      productCost,
      sellingPrice,
      mrp,
      gstRate,
      packagingCost,
      shippingCost,
      marketplaceFee,
      marketplaceFeePercent,
      otherExpenses,
      targetProfitAmount,
      targetProfitMarginPercent,
    });

    res.json({
      success: true,
      data: details,
    });
  });

  // POST /api/price/bulk-calculate - Bulk Product Price Calculations
  app.post('/api/price/bulk-calculate', (req, res) => {
    const { items, ruleId, defaultRule } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, error: 'Items array is required for bulk calculation.' });
    }

    let activeRule = defaultRule;
    if (ruleId) {
      const foundRule = db.pricingRules.find((r) => r.id === ruleId);
      if (foundRule) activeRule = foundRule;
    }

    const calculatedResults = items.map((item: any) => {
      const cost = Math.max(0, Number(item.costPrice ?? item.cost ?? 0));
      const sp = Math.max(0, Number(item.sellingPrice ?? item.price ?? 0));
      const mrp = Math.max(sp, Number(item.mrp ?? sp));

      const gst = Number(item.gstRate ?? activeRule?.gstRate ?? 5);
      const pkg = Number(item.packagingCost ?? activeRule?.packagingCost ?? 15);
      const ship = Number(item.shippingCost ?? activeRule?.shippingCost ?? 65);
      const feeFixed = Number(item.marketplaceFee ?? activeRule?.marketplaceFee ?? 10);
      const feePercent = Number(item.marketplaceFeePercent ?? activeRule?.marketplaceFeePercent ?? 12);
      const other = Number(item.otherExpenses ?? 0);

      const details = computePriceDetails({
        productCost: cost,
        sellingPrice: sp,
        mrp,
        gstRate: gst,
        packagingCost: pkg,
        shippingCost: ship,
        marketplaceFee: feeFixed,
        marketplaceFeePercent: feePercent,
        otherExpenses: other,
      });

      let status: 'PROFITABLE' | 'LOW_MARGIN' | 'LOSS_MAKING' | 'INVALID' = 'PROFITABLE';
      if (sp === 0 || isNaN(details.estimatedProfit)) {
        status = 'INVALID';
      } else if (details.estimatedProfit < 0) {
        status = 'LOSS_MAKING';
      } else if (details.profitMarginPercent < 10) {
        status = 'LOW_MARGIN';
      }

      return {
        productId: item.id || item.productId,
        title: item.title || item.name || 'Unnamed Product',
        sku: item.sku || 'N/A',
        costPrice: cost,
        sellingPrice: sp,
        mrp,
        gstRate: gst,
        estimatedProfit: details.estimatedProfit,
        profitMarginPercent: details.profitMarginPercent,
        estimatedSettlement: details.estimatedSettlement,
        breakEvenSellingPrice: details.breakEvenSellingPrice,
        status,
        details,
      };
    });

    res.json({
      success: true,
      count: calculatedResults.length,
      data: calculatedResults,
    });
  });

  // GET /api/price/rules - Fetch Pricing Rules
  app.get('/api/price/rules', (req, res) => {
    const user = getAuthUser(req);
    const userRules = db.pricingRules.filter((r) => r.userId === user.id || (user.isOwner && !r.userId));
    res.json({
      success: true,
      count: userRules.length,
      data: userRules,
    });
  });

  // POST /api/price/rules - Create Pricing Rule
  app.post('/api/price/rules', (req, res) => {
    const user = getAuthUser(req);
    const { name, gstRate, packagingCost, shippingCost, marketplaceFee, marketplaceFeePercent, targetMargin } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Rule name is required.' });
    }

    if (Number(gstRate) < 0 || Number(packagingCost) < 0 || Number(shippingCost) < 0 || Number(marketplaceFee) < 0 || Number(marketplaceFeePercent) < 0) {
      return res.status(400).json({ success: false, error: 'Rule parameters cannot be negative numbers.' });
    }

    const newRule: DBPricingRule = {
      id: `rule-${Date.now()}`,
      userId: user.id,
      name: name.trim(),
      gstRate: Math.max(0, Number(gstRate) || 0),
      packagingCost: Math.max(0, Number(packagingCost) || 0),
      shippingCost: Math.max(0, Number(shippingCost) || 0),
      marketplaceFee: Math.max(0, Number(marketplaceFee) || 0),
      marketplaceFeePercent: Math.max(0, Number(marketplaceFeePercent) || 0),
      targetMargin: Math.max(0, Number(targetMargin) || 15),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.pricingRules.unshift(newRule);

    res.status(201).json({
      success: true,
      message: `Pricing rule "${newRule.name}" created.`,
      data: newRule,
    });
  });

  // PUT /api/price/rules/:id - Update Pricing Rule
  app.put('/api/price/rules/:id', (req, res) => {
    const user = getAuthUser(req);
    const rule = db.pricingRules.find((r) => r.id === req.params.id && (r.userId === user.id || user.isOwner));
    if (!rule) {
      return res.status(404).json({ success: false, error: 'Pricing rule not found or access denied.' });
    }

    const { name, gstRate, packagingCost, shippingCost, marketplaceFee, marketplaceFeePercent, targetMargin } = req.body;

    if (name !== undefined) rule.name = name.trim();
    if (gstRate !== undefined) rule.gstRate = Math.max(0, Number(gstRate));
    if (packagingCost !== undefined) rule.packagingCost = Math.max(0, Number(packagingCost));
    if (shippingCost !== undefined) rule.shippingCost = Math.max(0, Number(shippingCost));
    if (marketplaceFee !== undefined) rule.marketplaceFee = Math.max(0, Number(marketplaceFee));
    if (marketplaceFeePercent !== undefined) rule.marketplaceFeePercent = Math.max(0, Number(marketplaceFeePercent));
    if (targetMargin !== undefined) rule.targetMargin = Math.max(0, Number(targetMargin));
    rule.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: `Pricing rule "${rule.name}" updated.`,
      data: rule,
    });
  });

  // DELETE /api/price/rules/:id - Delete Pricing Rule
  app.delete('/api/price/rules/:id', (req, res) => {
    const user = getAuthUser(req);
    const index = db.pricingRules.findIndex((r) => r.id === req.params.id && (r.userId === user.id || user.isOwner));
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Pricing rule not found or access denied.' });
    }

    const deleted = db.pricingRules.splice(index, 1)[0];

    res.json({
      success: true,
      message: `Pricing rule "${deleted.name}" deleted.`,
      data: { id: req.params.id },
    });
  });

  // -------------------------------------------------------------
  // PHASE 7B: IMAGE WORKSPACE & MANAGEMENT API
  // -------------------------------------------------------------

  // GET /api/images - Fetch images for product/listing or library
  app.get('/api/images', (req, res) => {
    const user = getAuthUser(req);
    const listingId = req.query.listingId as string;
    if (listingId) {
      const product = db.products.find((p) => p.id === listingId && (p.userId === user.id || user.isOwner));
      if (!product) {
        return res.status(404).json({ success: false, error: 'Listing not found or access denied.' });
      }
      return res.json({
        success: true,
        data: product.images || [],
        primaryImageIndex: product.primaryImageIndex || 0,
      });
    }

    // Collect all images across user's catalog
    const allImages: Array<{
      id: string;
      url: string;
      listingId: string;
      listingTitle: string;
      isPrimary: boolean;
    }> = [];

    const userProducts = db.products.filter((p) => p.userId === user.id || (user.isOwner && !p.userId));
    userProducts.forEach((p) => {
      (p.images || []).forEach((img) => {
        allImages.push({
          id: img.id,
          url: img.url,
          listingId: p.id,
          listingTitle: p.title,
          isPrimary: img.isPrimary,
        });
      });
    });

    res.json({
      success: true,
      count: allImages.length,
      data: allImages,
    });
  });

  // POST /api/images/validate - Server-side validation of image URLs
  app.post('/api/images/validate', (req, res) => {
    const { urls, marketplace } = req.body;

    if (!Array.isArray(urls)) {
      return res.status(400).json({ success: false, error: 'Array of image URLs is required.' });
    }

    const seenUrls = new Set<string>();
    const validationResults = urls.map((urlStr: string, idx: number) => {
      const trimmed = (urlStr || '').trim();

      if (!trimmed) {
        return {
          url: '',
          position: idx + 1,
          status: 'ERROR',
          message: 'Empty URL string provided.',
        };
      }

      // Format check (http/https)
      const isValidFormat = /^https?:\/\/.+\..+/i.test(trimmed);
      if (!isValidFormat) {
        return {
          url: trimmed,
          position: idx + 1,
          status: 'ERROR',
          message: 'Invalid URL format. Must start with http:// or https://',
        };
      }

      // Duplicate check in input list
      if (seenUrls.has(trimmed)) {
        return {
          url: trimmed,
          position: idx + 1,
          status: 'WARNING',
          message: 'Duplicate URL detected in workspace gallery.',
        };
      }
      seenUrls.add(trimmed);

      // In-line HTTP warning check
      if (trimmed.startsWith('http://')) {
        return {
          url: trimmed,
          position: idx + 1,
          status: 'WARNING',
          message: 'HTTP URL provided. HTTPS recommended for marketplace compliance.',
        };
      }

      return {
        url: trimmed,
        position: idx + 1,
        status: 'UNVERIFIED',
        message: 'URL format valid — accessibility not verified.',
      };
    });

    res.json({
      success: true,
      data: validationResults,
    });
  });

  // POST /api/images/apply - Apply images to one or multiple listings / variants
  app.post('/api/images/apply', (req, res) => {
    const user = getAuthUser(req);
    const { listingIds, images, variantIds, mode = 'overwrite' } = req.body;

    if (!Array.isArray(listingIds) || listingIds.length === 0) {
      return res.status(400).json({ success: false, error: 'At least 1 listing ID must be selected.' });
    }

    if (!Array.isArray(images)) {
      return res.status(400).json({ success: false, error: 'Images array is required.' });
    }

    const updatedListings: string[] = [];
    const failedListings: string[] = [];

    listingIds.forEach((id: string) => {
      const product = db.products.find((p) => p.id === id && (p.userId === user.id || user.isOwner));
      if (!product) {
        failedListings.push(id);
        return;
      }

      // If specific variantIds targeted
      if (Array.isArray(variantIds) && variantIds.length > 0 && product.variants) {
        product.variants.forEach((v) => {
          if (variantIds.includes(v.id) && images.length > 0) {
            v.imageUrl = images[0].url;
          }
        });
      }

      // Update product image gallery
      if (mode === 'append' && product.images) {
        product.images = [...product.images, ...images];
      } else {
        product.images = images.map((img: any, i: number) => ({
          id: img.id || `img-${Date.now()}-${i}`,
          url: img.url,
          altText: img.altText || product.title,
          isPrimary: i === 0,
        }));
        product.primaryImageIndex = 0;
      }

      product.updatedAt = new Date().toISOString();
      updatedListings.push(product.id);
    });

    res.json({
      success: true,
      updatedCount: updatedListings.length,
      failedCount: failedListings.length,
      updatedListingIds: updatedListings,
      message: `Successfully applied images to ${updatedListings.length} listing(s).`,
    });
  });

  // POST /api/images/reorder - Save reordered slots
  app.post('/api/images/reorder', (req, res) => {
    const user = getAuthUser(req);
    const { listingId, images } = req.body;

    if (!listingId || !Array.isArray(images)) {
      return res.status(400).json({ success: false, error: 'listingId and reordered images array are required.' });
    }

    const product = db.products.find((p) => p.id === listingId && (p.userId === user.id || user.isOwner));
    if (!product) {
      return res.status(404).json({ success: false, error: 'Listing not found or access denied.' });
    }

    product.images = images;
    product.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Image order saved.',
      data: product.images,
    });
  });

  // POST /api/images/process - External or server-side image processing
  app.post('/api/images/process', (req, res) => {
    const { action, imageUrl, options } = req.body;

    // Check if external cloud processing engine is configured
    const isCloudProcessingConfigured = false; // Configuration required for external background removal / cloud canvas

    if (!isCloudProcessingConfigured) {
      return res.status(200).json({
        success: false,
        configRequired: true,
        message: 'Configuration required. External image processing service is not configured. Browser-side HTML5 canvas tool is available for crop & resize.',
      });
    }

    res.json({
      success: true,
      message: 'Processing complete.',
    });
  });

  // -------------------------------------------------------------
  // VITE / STATIC SERVING
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Listivo Platform] Express Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Listivo Server Error]', err);
});
