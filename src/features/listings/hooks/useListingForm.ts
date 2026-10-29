import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductListing, ListingImage, ListingVariant, ValidationResults } from '../types/listing';
import { TemplateAttribute, VariantDimension } from '../../templates/types/template';
import { listingService } from '../services/listingService';
import { templateService } from '../../templates/services/templateService';
import { STUDIO_CATALOG_SAMPLES } from '../../image-maker/utils/studioSamples';

export type FormTab = 'info' | 'pricing' | 'variants' | 'images' | 'attributes' | 'preview';

export function useListingForm(initialId?: string) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FormTab>('info');
  const [isLoading, setIsLoading] = useState(!!initialId);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [sku, setSku] = useState('');
  const [styleId, setStyleId] = useState('');
  const [marketplace, setMarketplace] = useState<'meesho' | 'flipkart' | 'amazon' | 'meesho_top' | string>('meesho');
  const [category, setCategory] = useState('Apparel & Fashion');
  const [subCategory, setSubCategory] = useState('Kurtis & Tops');
  const [brand, setBrand] = useState('Listivo Merchant');
  const [material, setMaterial] = useState('100% Pure Cotton');
  const [description, setDescription] = useState('');
  const [keyFeatures, setKeyFeatures] = useState<string[]>([
    'Soft and breathable fabric for round-the-clock comfort',
    'Durable double stitching and color-fast vibrant dye',
  ]);

  // Pricing & Metrics
  const [sellingPrice, setSellingPrice] = useState<number>(499);
  const [mrp, setMrp] = useState<number>(999);
  const [costPrice, setCostPrice] = useState<number>(220);
  const [stock, setStock] = useState<number>(50);
  const [gstRate, setGstRate] = useState<number>(5);
  const [hsnCode, setHsnCode] = useState('6204');
  const [weightGrams, setWeightGrams] = useState<number>(250);
  const [lengthCm, setLengthCm] = useState<number>(25);
  const [widthCm, setWidthCm] = useState<number>(18);
  const [heightCm, setHeightCm] = useState<number>(4);
  const [returnPolicy, setReturnPolicy] = useState('7 Days Easy Return');
  const [careInstructions, setCareInstructions] = useState('Hand wash or machine wash cold');

  // Status & Template Link
  const [status, setStatus] = useState<'DRAFT' | 'INCOMPLETE' | 'READY' | 'EXPORTED'>('DRAFT');
  const [templateId, setTemplateId] = useState<string | undefined>(undefined);
  const [templateName, setTemplateName] = useState<string | undefined>(undefined);

  // Images & Media
  const [images, setImages] = useState<ListingImage[]>([
    {
      id: 'img-def-1',
      url: STUDIO_CATALOG_SAMPLES[0].url,
      isPrimary: true,
      altText: 'Front View',
    },
  ]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

  // Platform Attributes & Variants
  const [attributes, setAttributes] = useState<TemplateAttribute[]>([
    { id: 'attr-1', key: 'fabric', label: 'Fabric', type: 'dropdown', value: 'Cotton', options: ['Cotton', 'Rayon', 'Silk'], isRequired: true },
    { id: 'attr-2', key: 'sleeve_length', label: 'Sleeve Length', type: 'dropdown', value: 'Three-Quarter Sleeves', options: ['Three-Quarter Sleeves', 'Full Sleeves', 'Short Sleeves'], isRequired: true },
  ]);

  const [hasVariants, setHasVariants] = useState(true);
  const [variantDimensions, setVariantDimensions] = useState<VariantDimension[]>([
    { id: 'vdim-1', name: 'Color', options: ['Mustard Yellow', 'Navy Blue'] },
    { id: 'vdim-2', name: 'Size', options: ['S', 'M', 'L', 'XL'] },
  ]);
  const [variants, setVariants] = useState<ListingVariant[]>([
    { id: 'v-1', sku: 'SKU-YLW-S', attributes: { Color: 'Mustard Yellow', Size: 'S' }, price: 499, stock: 20 },
    { id: 'v-2', sku: 'SKU-YLW-M', attributes: { Color: 'Mustard Yellow', Size: 'M' }, price: 499, stock: 20 },
  ]);

  // Validation Drawer & AI Assistant States
  const [validationResults, setValidationResults] = useState<ValidationResults>({
    isValid: false,
    validCount: 8,
    warningCount: 1,
    errorCount: 1,
    issues: [],
  });
  const [isValidationDrawerOpen, setIsValidationDrawerOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // Initial Load for Editing
  useEffect(() => {
    if (initialId) {
      setIsLoading(true);
      listingService
        .getListingById(initialId)
        .then((data) => {
          setTitle(data.title || '');
          setSku(data.sku || '');
          setStyleId(data.styleId || '');
          setMarketplace(data.marketplace || 'meesho');
          setCategory(data.category || 'Apparel & Fashion');
          setSubCategory(data.subCategory || '');
          setBrand(data.brand || 'Listivo Merchant');
          setMaterial(data.material || '');
          setDescription(data.description || '');
          setKeyFeatures(data.keyFeatures || []);
          setSellingPrice(data.sellingPrice || 0);
          setMrp(data.mrp || 0);
          setCostPrice(data.costPrice || 0);
          setStock(data.stock || 0);
          setGstRate(data.gstRate || 5);
          setHsnCode(data.hsnCode || '6204');
          setWeightGrams(data.weightGrams || 250);
          setLengthCm(data.lengthCm || 20);
          setWidthCm(data.widthCm || 15);
          setHeightCm(data.heightCm || 5);
          setReturnPolicy(data.returnPolicy || '');
          setCareInstructions(data.careInstructions || '');
          setStatus(data.status || 'DRAFT');
          setTemplateId(data.templateId);
          setTemplateName(data.templateName);
          if (data.images && data.images.length > 0) {
            setImages(data.images);
          }
          if (data.attributes && data.attributes.length > 0) {
            setAttributes(data.attributes);
          }
          if (data.variantDimensions && data.variantDimensions.length > 0) {
            setVariantDimensions(data.variantDimensions);
          }
          if (data.variants && data.variants.length > 0) {
            setVariants(data.variants);
            setHasVariants(true);
          } else {
            setHasVariants(false);
          }
          if (data.validationResults) {
            setValidationResults(data.validationResults);
          }
        })
        .catch((err) => setError(err.message || 'Failed to load listing.'))
        .finally(() => setIsLoading(false));
    }
  }, [initialId]);

  // Load from Template when parameter specified in query string
  const populateFromTemplate = async (tplId: string) => {
    setIsLoading(true);
    try {
      const template = await templateService.getTemplateById(tplId);
      setTemplateId(template.id);
      setTemplateName(template.name);
      setTitle(`${template.brand || 'Brand'} ${template.subCategory || template.category} - ${template.name}`);
      setSku(`${template.skuPrefix}-${Math.floor(1000 + Math.random() * 9000)}`);
      setStyleId(`STYLE-${template.skuPrefix}-${Math.floor(100 + Math.random() * 900)}`);
      setMarketplace(template.marketplace || 'meesho');
      setCategory(template.category);
      setSubCategory(template.subCategory || '');
      setBrand(template.brand);
      setMaterial(template.material);
      setDescription(template.description);
      setKeyFeatures(template.keyFeatures || []);
      setSellingPrice(template.defaultPrice);
      setMrp(template.mrp);
      setCostPrice(Math.round(template.defaultPrice * 0.5));
      setGstRate(template.gstRate);
      setHsnCode(template.hsnCode);
      setWeightGrams(template.weightGrams);
      setLengthCm(template.lengthCm || 20);
      setWidthCm(template.widthCm || 15);
      setHeightCm(template.heightCm || 5);
      setReturnPolicy(template.returnPolicy);
      setCareInstructions(template.careInstructions);
      if (template.images && template.images.length > 0) {
        setImages(
          template.images.map((url, idx) => ({
            id: `img-tpl-${idx}`,
            url,
            isPrimary: idx === 0,
          }))
        );
      }
      if (template.attributes) {
        setAttributes(template.attributes);
      }
      if (template.variantDimensions && template.variantDimensions.length > 0) {
        setVariantDimensions(template.variantDimensions);
      }
      setSuccessMsg(`Pre-filled listing using template "${template.name}".`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to load template');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Auto SKU
  const generateSku = () => {
    const brandPrefix = brand.substring(0, 3).toUpperCase() || 'LST';
    const catPrefix = category.substring(0, 3).toUpperCase() || 'GEN';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newSku = `${brandPrefix}-${catPrefix}-${randomNum}`;
    setSku(newSku);
    setStyleId(`STYLE-${brandPrefix}-${Math.floor(100 + Math.random() * 900)}`);
  };

  // Calculate profit margin & ROI
  const calculatedMargin = sellingPrice > 0 ? ((sellingPrice - costPrice) / sellingPrice) * 100 : 0;
  const calculatedProfit = sellingPrice - costPrice;

  // Realtime Client-side Validation Engine
  const runValidation = useCallback(() => {
    const issues: ValidationResults['issues'] = [];

    if (!title.trim()) {
      issues.push({ field: 'title', section: 'Product Info', severity: 'error', message: 'Product title is required.' });
    } else if (title.trim().length < 10) {
      issues.push({ field: 'title', section: 'Product Info', severity: 'warning', message: 'Title should be at least 10 characters.' });
    }

    if (!sku.trim()) {
      issues.push({ field: 'sku', section: 'Product Info', severity: 'error', message: 'SKU Code is required.' });
    }

    if (!brand.trim()) {
      issues.push({ field: 'brand', section: 'Product Info', severity: 'error', message: 'Brand Name is required.' });
    }

    if (!sellingPrice || sellingPrice <= 0) {
      issues.push({ field: 'sellingPrice', section: 'Pricing', severity: 'error', message: 'Selling price must be greater than zero.' });
    }

    if (!mrp || mrp <= 0) {
      issues.push({ field: 'mrp', section: 'Pricing', severity: 'error', message: 'MRP must be provided.' });
    } else if (mrp < sellingPrice) {
      issues.push({ field: 'mrp', section: 'Pricing', severity: 'error', message: 'MRP cannot be less than selling price.' });
    }

    if (!hsnCode || hsnCode.trim().length < 4) {
      issues.push({ field: 'hsnCode', section: 'Pricing', severity: 'error', message: 'HSN code must be at least 4 digits.' });
    }

    if (!description || description.trim().length < 20) {
      issues.push({ field: 'description', section: 'Product Info', severity: 'warning', message: 'A detailed description (20+ chars) increases sales.' });
    }

    if (images.length === 0) {
      issues.push({ field: 'images', section: 'Images', severity: 'error', message: 'At least 1 product image is required.' });
    } else if (images.length < 2) {
      issues.push({ field: 'images', section: 'Images', severity: 'warning', message: 'Adding at least 2 images improves customer conversion.' });
    }

    for (const attr of attributes) {
      if (attr.isRequired && (!attr.value || attr.value === '')) {
        issues.push({
          field: `attr-${attr.key}`,
          section: 'Platform Attributes',
          severity: 'error',
          message: `Required attribute "${attr.label}" is missing a value.`,
        });
      }
    }

    const errorCount = issues.filter((i) => i.severity === 'error').length;
    const warningCount = issues.filter((i) => i.severity === 'warning').length;
    const isValid = errorCount === 0;

    const res: ValidationResults = {
      isValid,
      validCount: Math.max(0, 12 - errorCount - warningCount),
      warningCount,
      errorCount,
      issues,
    };
    setValidationResults(res);
    return res;
  }, [title, sku, brand, sellingPrice, mrp, hsnCode, description, images, attributes]);

  useEffect(() => {
    runValidation();
  }, [runValidation]);

  // Construct current Listing object
  const getFormData = (): Partial<ProductListing> => {
    return {
      templateId,
      templateName,
      title,
      sku,
      styleId,
      marketplace,
      category,
      subCategory,
      brand,
      material,
      description,
      keyFeatures,
      mrp: Number(mrp) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      costPrice: Number(costPrice) || 0,
      discountPercent: mrp > 0 ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0,
      stock: Number(stock) || 0,
      gstRate: Number(gstRate) || 5,
      hsnCode: String(hsnCode || ''),
      weightGrams: Number(weightGrams) || 250,
      lengthCm: Number(lengthCm) || 20,
      widthCm: Number(widthCm) || 15,
      heightCm: Number(heightCm) || 5,
      returnPolicy,
      careInstructions,
      status,
      images,
      primaryImageIndex,
      attributes,
      variantDimensions,
      variants: hasVariants ? variants : [],
      variantsCount: hasVariants && variants.length > 0 ? variants.length : 1,
    };
  };

  // Save Listing
  const handleSave = async (targetStatus?: 'DRAFT' | 'READY') => {
    setIsSaving(true);
    setError(null);
    try {
      const payload = getFormData();
      if (targetStatus) {
        payload.status = targetStatus;
      }

      let result: ProductListing;
      if (initialId) {
        result = await listingService.updateListing(initialId, payload);
      } else {
        result = await listingService.createListing(payload);
      }

      setLastSavedTime(new Date().toLocaleTimeString());
      setSuccessMsg(`Listing saved successfully (${result.status}).`);
      setTimeout(() => setSuccessMsg(null), 3000);

      if (!initialId) {
        navigate(`/listings/${result.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save listing.');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    isLoading,
    isSaving,
    lastSavedTime,
    error,
    setError,
    successMsg,
    setSuccessMsg,
    templateId,
    templateName,
    status,
    setStatus,

    // Form fields
    title,
    setTitle,
    sku,
    setSku,
    styleId,
    setStyleId,
    marketplace,
    setMarketplace,
    category,
    setCategory,
    subCategory,
    setSubCategory,
    brand,
    setBrand,
    material,
    setMaterial,
    description,
    setDescription,
    keyFeatures,
    setKeyFeatures,

    // Pricing & Metrics
    sellingPrice,
    setSellingPrice,
    mrp,
    setMrp,
    costPrice,
    setCostPrice,
    calculatedMargin,
    calculatedProfit,
    stock,
    setStock,
    gstRate,
    setGstRate,
    hsnCode,
    setHsnCode,
    weightGrams,
    setWeightGrams,
    lengthCm,
    setLengthCm,
    widthCm,
    setWidthCm,
    heightCm,
    setHeightCm,
    returnPolicy,
    setReturnPolicy,
    careInstructions,
    setCareInstructions,

    // Images
    images,
    setImages,
    primaryImageIndex,
    setPrimaryImageIndex,

    // Attributes & Variants
    attributes,
    setAttributes,
    hasVariants,
    setHasVariants,
    variantDimensions,
    setVariantDimensions,
    variants,
    setVariants,

    // Validation & Modals
    validationResults,
    isValidationDrawerOpen,
    setIsValidationDrawerOpen,
    isAIModalOpen,
    setIsAIModalOpen,

    // Actions
    generateSku,
    populateFromTemplate,
    handleSave,
  };
}
