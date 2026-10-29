import { ExtensionTemplateDTO, ExtensionListingDTO } from '../../shared/types';

export interface MappedFieldData {
  fieldKey: string;
  fieldLabel: string;
  value: any;
  sourceKey: string;
  isRequired: boolean;
  manualConfirmationRequired?: boolean;
}

export class MeeshoFieldMapper {
  /**
   * Map LISTIVO Template or Listing DTO into standardized field map for Meesho DOM adapter
   */
  public static mapData(
    data: ExtensionTemplateDTO | ExtensionListingDTO
  ): Record<string, MappedFieldData> {
    const isListing = 'title' in data && 'sku' in data;
    const templateData = data as ExtensionTemplateDTO;
    const listingData = data as ExtensionListingDTO;

    const mapped: Record<string, MappedFieldData> = {};

    // 1. Title / Product Name
    const titleVal = isListing ? listingData.title : templateData.name;
    if (titleVal) {
      mapped['title'] = {
        fieldKey: 'title',
        fieldLabel: 'Product Name / Title',
        value: titleVal,
        sourceKey: isListing ? 'listing.title' : 'template.name',
        isRequired: true,
      };
    }

    // 2. Description
    const descVal = data.description || (data.keyFeatures && data.keyFeatures.length > 0 ? data.keyFeatures.join('. ') : '');
    if (descVal) {
      mapped['description'] = {
        fieldKey: 'description',
        fieldLabel: 'Product Description',
        value: descVal,
        sourceKey: 'description',
        isRequired: true,
      };
    }

    // 3. Brand
    if (data.brand) {
      mapped['brand'] = {
        fieldKey: 'brand',
        fieldLabel: 'Brand Name',
        value: data.brand,
        sourceKey: 'brand',
        isRequired: false,
      };
    }

    // 4. Category
    const categoryVal = data.subCategory ? `${data.category} > ${data.subCategory}` : data.category;
    if (categoryVal) {
      mapped['category'] = {
        fieldKey: 'category',
        fieldLabel: 'Category',
        value: categoryVal,
        sourceKey: 'category',
        isRequired: true,
      };
    }

    // 5. Material / Fabric
    const materialVal = data.material || this.extractCustomAttr(data, ['material', 'fabric']);
    if (materialVal) {
      mapped['material'] = {
        fieldKey: 'material',
        fieldLabel: 'Fabric / Material',
        value: materialVal,
        sourceKey: 'material',
        isRequired: true,
      };
    }

    // 6. Color
    const colorVal = isListing ? '' : templateData.color || this.extractCustomAttr(data, ['color', 'primary_color']);
    if (colorVal) {
      mapped['color'] = {
        fieldKey: 'color',
        fieldLabel: 'Primary Color',
        value: colorVal,
        sourceKey: 'color',
        isRequired: true,
      };
    }

    // 7. SKU / Style ID
    const skuVal = isListing ? listingData.sku || listingData.styleId : templateData.skuPrefix;
    if (skuVal) {
      mapped['sku'] = {
        fieldKey: 'sku',
        fieldLabel: 'Style ID / SKU',
        value: skuVal,
        sourceKey: 'sku',
        isRequired: true,
      };
    }

    // 8. Selling Price (Price to Supplier)
    const priceVal = isListing
      ? listingData.sellingPrice
      : (templateData.defaultPrice || (data as any).priceBreakdown?.meeshoPrice || (data as any).priceBreakdown?.sellingPrice);
    if (priceVal && priceVal > 0) {
      mapped['sellingPrice'] = {
        fieldKey: 'sellingPrice',
        fieldLabel: 'Selling Price (INR)',
        value: priceVal,
        sourceKey: isListing ? 'listing.sellingPrice' : 'template.defaultPrice',
        isRequired: true,
      };
      mapped['meeshoPrice'] = {
        fieldKey: 'meeshoPrice',
        fieldLabel: 'Meesho Supplier Price (INR)',
        value: priceVal,
        sourceKey: isListing ? 'listing.sellingPrice' : 'template.meeshoPrice',
        isRequired: true,
      };
    }

    // 9. MRP
    let mrpVal = data.mrp || (data as any).priceBreakdown?.mrp || (priceVal ? Math.round(priceVal * 1.35) : undefined);
    if (priceVal && mrpVal && mrpVal < priceVal) {
      mrpVal = Math.round(priceVal * 1.25); // Prevent invalid MRP < sellingPrice
    }
    if (mrpVal && mrpVal > 0) {
      mapped['mrp'] = {
        fieldKey: 'mrp',
        fieldLabel: 'Maximum Retail Price (MRP)',
        value: mrpVal,
        sourceKey: 'mrp',
        isRequired: true,
      };
    }

    // 10. GST Rate & Percentage
    const rawGst = data.gstRate !== undefined ? data.gstRate : (data as any).gstPercentage;
    if (rawGst !== undefined && rawGst !== null) {
      const cleanGstNum = typeof rawGst === 'string' ? parseFloat(rawGst.replace(/[^0-9.]/g, '')) : Number(rawGst);
      mapped['gstRate'] = {
        fieldKey: 'gstRate',
        fieldLabel: 'GST Rate (%)',
        value: `${cleanGstNum}%`,
        sourceKey: 'gstRate',
        isRequired: true,
      };
      mapped['gstPercentage'] = {
        fieldKey: 'gstPercentage',
        fieldLabel: 'GST Percentage',
        value: cleanGstNum,
        sourceKey: 'gstPercentage',
        isRequired: true,
      };
    }

    // 11. HSN Code
    if (data.hsnCode) {
      mapped['hsnCode'] = {
        fieldKey: 'hsnCode',
        fieldLabel: 'HSN Code',
        value: data.hsnCode,
        sourceKey: 'hsnCode',
        isRequired: true,
      };
    }

    // 12. Package Weight (Grams)
    const weightVal = !isListing && templateData.weightGrams ? templateData.weightGrams : 250;
    mapped['weightGrams'] = {
      fieldKey: 'weightGrams',
      fieldLabel: 'Package Weight (Grams)',
      value: weightVal,
      sourceKey: 'weightGrams',
      isRequired: false,
    };

    // 13. Country of Origin (Mandatory on Meesho for all product listings)
    const originVal = this.extractCustomAttr(data, ['country_of_origin', 'origin', 'country']) || 'India';
    mapped['countryOfOrigin'] = {
      fieldKey: 'countryOfOrigin',
      fieldLabel: 'Country of Origin',
      value: originVal,
      sourceKey: 'attributes.countryOfOrigin',
      isRequired: true,
    };

    // 14. Manufacturer / Packer Details
    const manufacturerVal =
      this.extractCustomAttr(data, ['manufacturer', 'packer', 'producer']) ||
      (data.brand ? `${data.brand} Apparels Ltd.` : '');
    if (manufacturerVal) {
      mapped['manufacturer'] = {
        fieldKey: 'manufacturer',
        fieldLabel: 'Manufacturer / Packer Details',
        value: manufacturerVal,
        sourceKey: 'attributes.manufacturer',
        isRequired: false,
      };
    }

    // 15. Images (Marked as manual confirmation required)
    const imagesVal = isListing ? listingData.images : templateData.images;
    if (imagesVal && imagesVal.length > 0) {
      mapped['images'] = {
        fieldKey: 'images',
        fieldLabel: 'Product Images Upload',
        value: imagesVal,
        sourceKey: 'images',
        isRequired: true,
        manualConfirmationRequired: true,
      };
    }

    return mapped;
  }

  private static extractCustomAttr(
    data: ExtensionTemplateDTO | ExtensionListingDTO,
    keys: string[]
  ): string | null {
    if (!data.attributes || !Array.isArray(data.attributes)) return null;

    for (const attr of data.attributes) {
      const k = attr.key.toLowerCase();
      if (keys.some((target) => k.includes(target.toLowerCase()))) {
        return String(attr.value);
      }
    }
    return null;
  }
}
