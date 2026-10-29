import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListingTemplate, CATEGORY_PRESETS, TemplateAttribute, VariantDimension, PlatformMapping } from '../types/template';
import { templateService } from '../services/templateService';
import { STUDIO_CATALOG_SAMPLES } from '../../image-maker/utils/studioSamples';

export const useTemplateForm = (initialTemplate?: ListingTemplate) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<ListingTemplate>>(() => {
    if (initialTemplate) return initialTemplate;
    return {
      name: '',
      marketplace: 'meesho',
      category: 'Apparel',
      subCategory: 'Kurtis',
      brand: '',
      productType: '',
      material: '',
      color: '',
      pattern: '',
      description: '',
      keyFeatures: [''],
      gstRate: 5,
      hsnCode: '6204',
      weightGrams: 280,
      lengthCm: 25,
      widthCm: 20,
      heightCm: 5,
      defaultPrice: 499,
      mrp: 999,
      discountPercent: 50,
      returnPolicy: '7 Days Easy Return',
      careInstructions: 'Hand Wash or Machine Wash Cold',
      skuPrefix: 'SKU-TPL',
      tags: [],
      images: [STUDIO_CATALOG_SAMPLES[0].url],
      primaryImageIndex: 0,
      attributes: CATEGORY_PRESETS.Apparel.defaultAttributes.map((attr, idx) => ({
        ...attr,
        id: `attr-${idx + 1}`,
      })),
      variantDimensions: [
        { id: 'vdim-1', name: 'Color', options: ['Red', 'Blue'] },
        { id: 'vdim-2', name: 'Size', options: ['S', 'M', 'L', 'XL'] },
      ],
      platformMappings: {
        meesho: { fabric: 'Fabric', neck_type: 'Neck/Collar', sleeve_length: 'Sleeve Length', fit: 'Fit/Shape' },
        flipkart: { fabric: 'Material', neck_type: 'Neckline', sleeve_length: 'Sleeve Type', fit: 'Fit' },
      },
    };
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-calculate discount when MRP or Default Price changes
  useEffect(() => {
    const mrp = Number(formData.mrp) || 0;
    const price = Number(formData.defaultPrice) || 0;
    if (mrp > price && mrp > 0) {
      const computedDiscount = Math.round(((mrp - price) / mrp) * 100);
      setFormData((prev) => ({ ...prev, discountPercent: computedDiscount }));
    }
  }, [formData.mrp, formData.defaultPrice]);

  const updateField = (field: keyof ListingTemplate, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Handle category change -> auto-populate category preset defaults
  const handleCategoryChange = (newCategory: string) => {
    const preset = CATEGORY_PRESETS[newCategory];
    const newSubCategory = preset ? preset.subCategories[0] : '';
    const newAttrs: TemplateAttribute[] = preset
      ? preset.defaultAttributes.map((attr, idx) => ({ ...attr, id: `attr-${Date.now()}-${idx}` }))
      : [];

    setFormData((prev) => ({
      ...prev,
      category: newCategory,
      subCategory: newSubCategory,
      attributes: newAttrs,
    }));
    setIsDirty(true);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.name || !formData.name.trim()) {
      errs.name = 'Template Name is required.';
    }
    if (!formData.category) {
      errs.category = 'Category is required.';
    }
    if (!formData.marketplace) {
      errs.marketplace = 'Platform / Marketplace is required.';
    }
    if (!formData.hsnCode || !formData.hsnCode.trim()) {
      errs.hsnCode = 'HSN Code is required for GST compliance.';
    }
    if (Number(formData.defaultPrice) <= 0) {
      errs.defaultPrice = 'Default Selling Price must be greater than 0.';
    }
    if (Number(formData.mrp) < Number(formData.defaultPrice)) {
      errs.mrp = 'MRP cannot be lower than default selling price.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveTemplate = async (createListing = false): Promise<ListingTemplate | null> => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return null;
    }

    setIsSaving(true);
    try {
      let saved: ListingTemplate;
      if (initialTemplate?.id) {
        saved = await templateService.updateTemplate(initialTemplate.id, formData);
      } else {
        saved = await templateService.createTemplate(formData);
      }

      setIsDirty(false);

      if (createListing) {
        await templateService.createListingFromTemplate(saved.id);
        navigate('/listings');
      } else {
        navigate('/templates');
      }
      return saved;
    } catch (err: any) {
      setErrors({ server: err.message || 'Failed to save template.' });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    formData,
    updateField,
    handleCategoryChange,
    isDirty,
    isSaving,
    errors,
    saveTemplate,
    setFormData,
  };
};
