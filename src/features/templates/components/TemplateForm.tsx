import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  Plus,
  ArrowLeft,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { useTemplateForm } from '../hooks/useTemplateForm';
import { ListingTemplate, CATEGORY_PRESETS } from '../types/template';
import { AttributeBuilder } from './AttributeBuilder';
import { VariantMatrixConfig } from './VariantMatrixConfig';
import { PlatformMappingConfig } from './PlatformMappingConfig';
import { TemplatePreview } from './TemplatePreview';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';

interface TemplateFormProps {
  initialTemplate?: ListingTemplate;
  isEditing?: boolean;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({
  initialTemplate,
  isEditing = false,
}) => {
  const navigate = useNavigate();
  const {
    formData,
    updateField,
    handleCategoryChange,
    isDirty,
    isSaving,
    errors,
    saveTemplate,
  } = useTemplateForm(initialTemplate);

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showExitModal, setShowExitModal] = useState(false);

  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    const currentImgs = formData.images || [];
    updateField('images', [...currentImgs, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    const currentImgs = formData.images || [];
    const updated = currentImgs.filter((_, i) => i !== index);
    updateField('images', updated);
    if (formData.primaryImageIndex && formData.primaryImageIndex >= updated.length) {
      updateField('primaryImageIndex', 0);
    }
  };

  const handleAddFeature = () => {
    const current = formData.keyFeatures || [];
    updateField('keyFeatures', [...current, '']);
  };

  const handleUpdateFeature = (index: number, val: string) => {
    const current = [...(formData.keyFeatures || [])];
    current[index] = val;
    updateField('keyFeatures', current);
  };

  const handleRemoveFeature = (index: number) => {
    const current = (formData.keyFeatures || []).filter((_, i) => i !== index);
    updateField('keyFeatures', current);
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowExitModal(true);
    } else {
      navigate('/templates');
    }
  };

  const selectClassName =
    'w-full text-sm bg-white border border-[#E4E7EC] rounded-lg px-3.5 py-2 text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6] cursor-pointer';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#E4E7EC]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Back to templates"
            className="p-2 text-[#667085] hover:text-[#101828] bg-white hover:bg-[#F8FAFC] rounded-lg border border-[#E4E7EC] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="text-xs font-medium text-[#667085]">
              Listing Templates · {isEditing ? 'Edit Template' : 'New Template'}
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-[#101828]">
              {isEditing
                ? `Edit: ${formData.name || 'Template'}`
                : 'Create Reusable Listing Template'}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            isLoading={isSaving}
            onClick={() => saveTemplate(false)}
            icon={<Save className="w-4 h-4" />}
          >
            Save Template
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={isSaving}
            onClick={() => saveTemplate(true)}
            icon={<PlusCircle className="w-4 h-4" />}
          >
            Save &amp; Create Listing
          </Button>
        </div>
      </div>

      {errors.server && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errors.server}</span>
        </div>
      )}

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* 01. Basic Information */}
          <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-[#101828]">01. Basic Information</h2>
              <p className="text-xs text-[#667085] mt-0.5">
                Core marketplace target, category classification, and SKU naming prefix.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Template Name *"
                placeholder="e.g. Kurtis & Suits Standard"
                value={formData.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                error={errors.name}
                hint="Descriptive name for internal identification."
              />

              <div>
                <label className="block text-xs font-medium text-[#101828] mb-1.5">
                  Platform / Marketplace *
                </label>
                <select
                  value={formData.marketplace || 'meesho'}
                  onChange={(e) => updateField('marketplace', e.target.value)}
                  className={selectClassName}
                >
                  <option value="meesho">Meesho (Extension Autofill Enabled)</option>
                  <option value="flipkart">Flipkart Bulk Upload</option>
                  <option value="amazon">Amazon India</option>
                  <option value="myntra">Myntra</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#101828] mb-1.5">
                  Product Category *
                </label>
                <select
                  value={formData.category || 'Apparel'}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className={selectClassName}
                >
                  {Object.keys(CATEGORY_PRESETS).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#101828] mb-1.5">
                  Subcategory
                </label>
                <select
                  value={formData.subCategory || ''}
                  onChange={(e) => updateField('subCategory', e.target.value)}
                  className={selectClassName}
                >
                  {(CATEGORY_PRESETS[formData.category || 'Apparel']?.subCategories || []).map(
                    (sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    )
                  )}
                </select>
              </div>

              <Input
                label="Brand Name"
                placeholder="e.g. TrendApparel, UrbanStep"
                value={formData.brand || ''}
                onChange={(e) => updateField('brand', e.target.value)}
              />

              <Input
                label="SKU Prefix"
                placeholder="e.g. KURTI-RAYON"
                value={formData.skuPrefix || ''}
                onChange={(e) => updateField('skuPrefix', e.target.value)}
                hint="Base prefix used when generating variant SKUs."
              />
            </div>
          </div>

          {/* 02. Product Specifications & Text */}
          <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-[#101828]">
                02. Product Specifications &amp; Copy
              </h2>
              <p className="text-xs text-[#667085] mt-0.5">
                Default fabric, color, reusable description copy, and care policies.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Material / Fabric"
                placeholder="e.g. 100% Pure Rayon"
                value={formData.material || ''}
                onChange={(e) => updateField('material', e.target.value)}
              />
              <Input
                label="Color"
                placeholder="e.g. Mustard Yellow"
                value={formData.color || ''}
                onChange={(e) => updateField('color', e.target.value)}
              />
              <Input
                label="Pattern"
                placeholder="e.g. Foil Printed"
                value={formData.pattern || ''}
                onChange={(e) => updateField('pattern', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#101828] mb-1.5">
                Description Template
              </label>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Write a reusable product description template..."
                className="w-full text-sm bg-white border border-[#E4E7EC] rounded-lg p-3 text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-[#101828]">
                  Key Feature Bullet Points
                </label>
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="text-xs font-semibold text-[#0F766E] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Feature
                </button>
              </div>

              {(formData.keyFeatures || []).map((feat, fIdx) => (
                <div key={fIdx} className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#667085] w-4">•</span>
                  <input
                    type="text"
                    value={feat}
                    onChange={(e) => handleUpdateFeature(fIdx, e.target.value)}
                    placeholder={`Key feature #${fIdx + 1}`}
                    className="flex-1 text-xs bg-white border border-[#E4E7EC] rounded-lg px-3 py-2 text-[#101828] focus:outline-none focus:border-[#14B8A6]"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(fIdx)}
                    aria-label="Remove feature"
                    className="p-1.5 text-[#667085] hover:text-rose-600 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Care Instructions"
                placeholder="e.g. Machine Wash Cold"
                value={formData.careInstructions || ''}
                onChange={(e) => updateField('careInstructions', e.target.value)}
              />
              <Input
                label="Return & Exchange Policy"
                placeholder="e.g. 7 Days Easy Return"
                value={formData.returnPolicy || ''}
                onChange={(e) => updateField('returnPolicy', e.target.value)}
              />
            </div>
          </div>

          {/* 03. Pricing, GST & Package Dimensions */}
          <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-[#101828]">
                03. Pricing, GST &amp; Package Dimensions
              </h2>
              <p className="text-xs text-[#667085] mt-0.5">
                Default MRP, selling price, GST slab, HSN code, and volumetric weight.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Maximum Retail Price (MRP ₹) *"
                type="number"
                value={formData.mrp || ''}
                onChange={(e) => updateField('mrp', Number(e.target.value))}
                error={errors.mrp}
              />
              <Input
                label="Default Selling Price (₹) *"
                type="number"
                value={formData.defaultPrice || ''}
                onChange={(e) => updateField('defaultPrice', Number(e.target.value))}
                error={errors.defaultPrice}
              />
              <Input
                label="Calculated Discount (%)"
                type="number"
                disabled
                value={formData.discountPercent || 0}
                hint="Auto-computed from MRP & Selling Price."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#101828] mb-1.5">
                  GST Rate (%) *
                </label>
                <select
                  value={formData.gstRate || 5}
                  onChange={(e) => updateField('gstRate', Number(e.target.value))}
                  className={selectClassName}
                >
                  <option value={0}>0% GST (Exempt)</option>
                  <option value={3}>3% GST (Jewelry / Precious)</option>
                  <option value={5}>5% GST (Apparel &amp; Textile)</option>
                  <option value={12}>12% GST (Footwear / Leather)</option>
                  <option value={18}>18% GST (Electronics &amp; Home)</option>
                  <option value={28}>28% GST (Luxury Goods)</option>
                </select>
              </div>

              <Input
                label="HSN Code *"
                placeholder="e.g. 6204"
                value={formData.hsnCode || ''}
                onChange={(e) => updateField('hsnCode', e.target.value)}
                error={errors.hsnCode}
              />

              <Input
                label="Package Weight (Grams) *"
                type="number"
                value={formData.weightGrams || ''}
                onChange={(e) => updateField('weightGrams', Number(e.target.value))}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-[#E4E7EC]">
              <Input
                label="Length (cm)"
                type="number"
                value={formData.lengthCm || ''}
                onChange={(e) => updateField('lengthCm', Number(e.target.value))}
              />
              <Input
                label="Width (cm)"
                type="number"
                value={formData.widthCm || ''}
                onChange={(e) => updateField('widthCm', Number(e.target.value))}
              />
              <Input
                label="Height (cm)"
                type="number"
                value={formData.heightCm || ''}
                onChange={(e) => updateField('heightCm', Number(e.target.value))}
              />
            </div>
          </div>

          {/* 04. Image Slots */}
          <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-[#101828]">04. Default Image Slots</h2>
              <p className="text-xs text-[#667085] mt-0.5">
                Optional reference images or size-chart graphics inherited by listings.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Paste hosted image URL (https://...)"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="flex-1 text-xs bg-white border border-[#E4E7EC] rounded-lg px-3.5 py-2 text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6]"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddImage}>
                Add Image
              </Button>
            </div>

            {(formData.images || []).length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(formData.images || []).map((imgUrl, imgIdx) => (
                  <div
                    key={imgIdx}
                    className={`bg-[#F8FAFC] border rounded-lg overflow-hidden p-1.5 transition-colors ${
                      formData.primaryImageIndex === imgIdx
                        ? 'border-[#14B8A6] ring-2 ring-[#14B8A6]/20'
                        : 'border-[#E4E7EC]'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Template Slot ${imgIdx + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                      referrerPolicy="no-referrer"
                    />
                    <div className="mt-1.5 flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => updateField('primaryImageIndex', imgIdx)}
                        className={`font-semibold cursor-pointer ${
                          formData.primaryImageIndex === imgIdx
                            ? 'text-[#0F766E]'
                            : 'text-[#667085] hover:text-[#101828]'
                        }`}
                      >
                        {formData.primaryImageIndex === imgIdx ? 'Primary' : 'Set Primary'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(imgIdx)}
                        className="text-rose-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 05. Dynamic Category Attributes */}
          <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 space-y-4">
            <AttributeBuilder
              attributes={formData.attributes || []}
              onChange={(attrs) => updateField('attributes', attrs)}
            />
          </div>

          {/* 06. Variant Dimensions & Matrix */}
          <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 space-y-4">
            <VariantMatrixConfig
              variantDimensions={formData.variantDimensions || []}
              skuPrefix={formData.skuPrefix || 'SKU'}
              defaultPrice={Number(formData.defaultPrice) || 499}
              onChange={(dims) => updateField('variantDimensions', dims)}
            />
          </div>

          {/* 07. Marketplace Field Mapping Layer */}
          <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 space-y-4">
            <PlatformMappingConfig
              attributes={formData.attributes || []}
              platformMappings={
                (formData.platformMappings as any) || { meesho: {}, flipkart: {} }
              }
              onChange={(mappings) => updateField('platformMappings', mappings)}
            />
          </div>
        </div>

        {/* Right Column: Sticky Live Preview */}
        <div className="lg:col-span-1">
          <TemplatePreview template={formData} />
        </div>
      </div>

      {/* Unsaved Changes Modal */}
      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="Discard Unsaved Changes?"
        subtitle="You have unsaved edits in this template."
        maxWidth="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowExitModal(false)}>
              Keep Editing
            </Button>
            <Button variant="danger" size="sm" onClick={() => navigate('/templates')}>
              Discard Changes
            </Button>
          </>
        }
      >
        <p className="text-xs text-[#667085]">
          Leaving now will discard any unsaved template fields, attributes, or variant rules.
        </p>
      </Modal>
    </div>
  );
};
