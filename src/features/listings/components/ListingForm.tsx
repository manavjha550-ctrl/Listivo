import React, { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Image as ImageIcon,
  IndianRupee,
  Tag,
  Info,
  Eye,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useListingForm, FormTab } from '../hooks/useListingForm';
import { ProductInfoSection } from './ProductInfoSection';
import { PricingSection } from './PricingSection';
import { VariantsManager } from './VariantsManager';
import { ImagesManager } from './ImagesManager';
import { PlatformAttributesSection } from './PlatformAttributesSection';
import { AIAssistantDrawer } from '../../ai/components/AIAssistantDrawer';
import { ValidationDrawer } from './ValidationDrawer';
import { MarketplacePreview } from './MarketplacePreview';

export const ListingForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const templateParam = searchParams.get('template');
  const navigate = useNavigate();

  const form = useListingForm(id);

  useEffect(() => {
    if (templateParam && !id) {
      form.populateFromTemplate(templateParam);
    }
  }, [templateParam, id]);

  if (form.isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-xs text-[#667085]">
        <div className="w-7 h-7 border-2 border-[#14B8A6] border-t-transparent rounded-full animate-spin" />
        <span className="font-medium text-[#101828]">Loading product listing...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-28 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#E4E7EC]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/listings')}
            aria-label="Back to listings"
            className="p-2 rounded-lg border border-[#E4E7EC] bg-white text-[#667085] hover:text-[#101828] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#667085]">
              <span>Product Listings</span>
              {form.templateName && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-[#0F766E]">
                    Template: {form.templateName}
                  </span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#101828]">
              {id ? 'Edit Product Listing' : 'Create Product Listing'}
            </h1>
            <p className="text-xs text-[#667085] mt-0.5">
              {form.lastSavedTime
                ? `Last saved at ${form.lastSavedTime}`
                : 'Complete required fields to validate for marketplace export'}
            </p>
          </div>
        </div>

        {/* Actions & Validation Status */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => form.setIsValidationDrawerOpen(true)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              form.validationResults.isValid
                ? 'bg-[#14B8A6]/10 text-[#0F766E] border-[#14B8A6]/30 hover:bg-[#14B8A6]/15'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            {form.validationResults.isValid ? (
              <CheckCircle2 className="w-4 h-4 text-[#14B8A6]" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            )}
            <span className="font-mono tabular-nums">
              {form.validationResults.isValid
                ? 'Valid Listing'
                : `${form.validationResults.errorCount} Validation Errors`}
            </span>
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => form.handleSave('DRAFT')}
            isLoading={form.isSaving}
            icon={<Save className="w-3.5 h-3.5" />}
          >
            Save Draft
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => form.handleSave('READY')}
            isLoading={form.isSaving}
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
          >
            Mark Ready
          </Button>
        </div>
      </div>

      {/* Feedback Banners */}
      {form.error && (
        <div className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{form.error}</span>
        </div>
      )}

      {form.successMsg && (
        <div className="px-4 py-3 bg-[#14B8A6]/10 border border-[#14B8A6]/30 rounded-lg text-xs text-[#0F766E] font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#14B8A6] shrink-0" />
          <span>{form.successMsg}</span>
        </div>
      )}

      {/* Segmented Section Tabs */}
      <div className="bg-white border border-[#E4E7EC] rounded-xl p-1 flex items-center gap-1 overflow-x-auto">
        {[
          { id: 'info', label: 'Product Info', icon: Info },
          { id: 'pricing', label: 'Pricing & GST', icon: IndianRupee },
          { id: 'variants', label: 'Variant Matrix', icon: Layers },
          { id: 'images', label: 'Image Gallery', icon: ImageIcon },
          { id: 'attributes', label: 'Platform Attributes', icon: Tag },
          { id: 'preview', label: 'Customer Preview', icon: Eye },
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isActive = form.activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => form.setActiveTab(tab.id as FormTab)}
              className={`flex-1 min-w-[128px] py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#101828] text-white'
                  : 'text-[#667085] hover:bg-[#F8FAFC] hover:text-[#101828]'
              }`}
            >
              <IconComponent className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panel */}
      <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 min-h-[400px]">
        {form.activeTab === 'info' && (
          <ProductInfoSection
            title={form.title}
            setTitle={form.setTitle}
            sku={form.sku}
            setSku={form.setSku}
            styleId={form.styleId}
            setStyleId={form.setStyleId}
            marketplace={form.marketplace}
            setMarketplace={form.setMarketplace}
            category={form.category}
            setCategory={form.setCategory}
            subCategory={form.subCategory}
            setSubCategory={form.setSubCategory}
            brand={form.brand}
            setBrand={form.setBrand}
            material={form.material}
            setMaterial={form.setMaterial}
            description={form.description}
            setDescription={form.setDescription}
            keyFeatures={form.keyFeatures}
            setKeyFeatures={form.setKeyFeatures}
            generateSku={form.generateSku}
            onOpenAIModal={() => form.setIsAIModalOpen(true)}
          />
        )}

        {form.activeTab === 'pricing' && (
          <PricingSection
            sellingPrice={form.sellingPrice}
            setSellingPrice={form.setSellingPrice}
            mrp={form.mrp}
            setMrp={form.setMrp}
            costPrice={form.costPrice}
            setCostPrice={form.setCostPrice}
            marginPercent={form.calculatedMargin}
            profitAmount={form.calculatedProfit}
            stock={form.stock}
            setStock={form.setStock}
            gstRate={form.gstRate}
            setGstRate={form.setGstRate}
            hsnCode={form.hsnCode}
            setHsnCode={form.setHsnCode}
            weightGrams={form.weightGrams}
            setWeightGrams={form.setWeightGrams}
            lengthCm={form.lengthCm}
            setLengthCm={form.setLengthCm}
            widthCm={form.widthCm}
            setWidthCm={form.setWidthCm}
            heightCm={form.heightCm}
            setHeightCm={form.setHeightCm}
            returnPolicy={form.returnPolicy}
            setReturnPolicy={form.setReturnPolicy}
            careInstructions={form.careInstructions}
            setCareInstructions={form.setCareInstructions}
          />
        )}

        {form.activeTab === 'variants' && (
          <VariantsManager
            hasVariants={form.hasVariants}
            setHasVariants={form.setHasVariants}
            variantDimensions={form.variantDimensions}
            setVariantDimensions={form.setVariantDimensions}
            variants={form.variants}
            setVariants={form.setVariants}
            baseSku={form.sku}
            basePrice={form.sellingPrice}
          />
        )}

        {form.activeTab === 'images' && (
          <ImagesManager
            images={form.images}
            setImages={form.setImages}
            primaryImageIndex={form.primaryImageIndex}
            setPrimaryImageIndex={form.setPrimaryImageIndex}
          />
        )}

        {form.activeTab === 'attributes' && (
          <PlatformAttributesSection
            attributes={form.attributes}
            setAttributes={form.setAttributes}
            marketplace={form.marketplace}
            category={form.category}
          />
        )}

        {form.activeTab === 'preview' && (
          <MarketplacePreview
            title={form.title}
            brand={form.brand}
            category={form.category}
            marketplace={form.marketplace}
            sellingPrice={form.sellingPrice}
            mrp={form.mrp}
            discountPercent={
              form.mrp > 0 ? Math.round(((form.mrp - form.sellingPrice) / form.mrp) * 100) : 0
            }
            images={form.images}
            description={form.description}
            keyFeatures={form.keyFeatures}
            hasVariants={form.hasVariants}
            variantsCount={form.variants.length}
            returnPolicy={form.returnPolicy}
          />
        )}
      </div>

      {/* Bottom Action Bar — Positioned above mobile bottom nav bar on <lg and offset by w-60 sidebar on >=lg */}
      <div className="fixed bottom-14 lg:bottom-0 left-0 lg:left-60 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E4E7EC] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => form.setIsValidationDrawerOpen(true)}
            className="text-xs font-medium text-[#101828] hover:text-[#0F766E] flex items-center gap-1.5 cursor-pointer"
          >
            {form.validationResults.issues.length === 0 ? (
              <CheckCircle2 className="w-4 h-4 text-[#14B8A6]" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            )}
            <span className="font-mono tabular-nums">
              {form.validationResults.issues.length === 0
                ? 'All readiness checks passed'
                : `${form.validationResults.issues.length} validation issue(s)`}
            </span>
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => form.handleSave('DRAFT')}
              isLoading={form.isSaving}
            >
              Save Draft
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => form.handleSave('READY')}
              isLoading={form.isSaving}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Mark as Ready
            </Button>
          </div>
        </div>
      </div>

      {/* Drawers */}
      <AIAssistantDrawer
        isOpen={form.isAIModalOpen}
        onClose={() => form.setIsAIModalOpen(false)}
        initialMode="description"
        contextData={{
          title: form.title,
          brand: form.brand,
          category: form.category,
          subCategory: form.subCategory,
          material: form.material,
          marketplace: form.marketplace,
          price: form.sellingPrice,
          mrp: form.mrp,
          keyFeatures: form.keyFeatures,
          currentText: form.description,
          productId: id,
        }}
        onApply={(field, val) => {
          if (field === 'title') form.setTitle(val);
          if (field === 'description') form.setDescription(val);
          if (field === 'keyFeatures') form.setKeyFeatures(val);
          if (field === 'tags' && Array.isArray(val)) form.setKeyFeatures(val);
          form.setSuccessMsg('AI-generated content applied to listing.');
          setTimeout(() => form.setSuccessMsg(null), 3000);
        }}
      />

      <ValidationDrawer
        isOpen={form.isValidationDrawerOpen}
        onClose={() => form.setIsValidationDrawerOpen(false)}
        validation={form.validationResults}
      />
    </div>
  );
};
