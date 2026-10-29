import {
  PricingCalculationInput,
  PricingCalculationResult,
  PricingRule,
  BulkCalculatorItem,
  BulkCalculatedResultItem,
} from '../types';

export class PriceCalculatorService {
  /**
   * Local Client-Side Calculation Math
   */
  public calculateLocally(input: PricingCalculationInput): PricingCalculationResult {
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
    if (
      (input.targetProfitAmount !== undefined && input.targetProfitAmount > 0) ||
      (input.targetProfitMarginPercent !== undefined && input.targetProfitMarginPercent > 0)
    ) {
      let reqPrice = 0;
      if (input.targetProfitAmount !== undefined && input.targetProfitAmount > 0) {
        reqPrice = variableRate < 1 ? (fixedExpenses + input.targetProfitAmount) / (1 - variableRate) : 0;
      } else if (input.targetProfitMarginPercent !== undefined && input.targetProfitMarginPercent > 0) {
        const targetMarginDec = input.targetProfitMarginPercent / 100;
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

  /**
   * POST /api/price/calculate
   */
  public async calculatePrice(input: PricingCalculationInput): Promise<PricingCalculationResult> {
    try {
      const res = await fetch('/api/price/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    } catch (err) {
      console.warn('API Price calculate error, falling back to local math:', err);
    }
    return this.calculateLocally(input);
  }

  /**
   * POST /api/price/bulk-calculate
   */
  public async calculateBulkPrices(
    items: BulkCalculatorItem[],
    ruleId?: string,
    defaultRule?: Partial<PricingRule>
  ): Promise<BulkCalculatedResultItem[]> {
    try {
      const res = await fetch('/api/price/bulk-calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, ruleId, defaultRule }),
      });

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    } catch (err) {
      console.warn('API Bulk calculate error, falling back to client-side iteration:', err);
    }

    // Client-side fallback
    return items.map((item) => {
      const cost = Math.max(0, Number(item.costPrice || 0));
      const sp = Math.max(0, Number(item.sellingPrice || 0));
      const mrp = Math.max(sp, Number(item.mrp || sp));
      const gst = Number(item.gstRate ?? defaultRule?.gstRate ?? 5);
      const pkg = Number(item.packagingCost ?? defaultRule?.packagingCost ?? 15);
      const ship = Number(item.shippingCost ?? defaultRule?.shippingCost ?? 65);
      const feeFixed = Number(item.marketplaceFee ?? defaultRule?.marketplaceFee ?? 10);
      const feePercent = Number(item.marketplaceFeePercent ?? defaultRule?.marketplaceFeePercent ?? 12);

      const details = this.calculateLocally({
        productCost: cost,
        sellingPrice: sp,
        mrp,
        gstRate: gst,
        packagingCost: pkg,
        shippingCost: ship,
        marketplaceFee: feeFixed,
        marketplaceFeePercent: feePercent,
        otherExpenses: 0,
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
        productId: item.id,
        title: item.title,
        sku: item.sku,
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
  }

  /**
   * GET /api/price/rules
   */
  public async getPricingRules(): Promise<PricingRule[]> {
    try {
      const res = await fetch('/api/price/rules');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    } catch (err) {
      console.warn('Error fetching pricing rules:', err);
    }
    return [
      {
        id: 'rule-101',
        userId: 'owner-uuid-1000-8000-000000000001',
        name: 'Standard Kurti Pricing',
        gstRate: 5,
        packagingCost: 15,
        shippingCost: 65,
        marketplaceFee: 10,
        marketplaceFeePercent: 12,
        targetMargin: 25,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  /**
   * POST /api/price/rules
   */
  public async createPricingRule(rule: Partial<PricingRule>): Promise<PricingRule> {
    const res = await fetch('/api/price/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to create pricing rule');
    }
    return json.data;
  }

  /**
   * PUT /api/price/rules/:id
   */
  public async updatePricingRule(id: string, rule: Partial<PricingRule>): Promise<PricingRule> {
    const res = await fetch(`/api/price/rules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to update pricing rule');
    }
    return json.data;
  }

  /**
   * DELETE /api/price/rules/:id
   */
  public async deletePricingRule(id: string): Promise<void> {
    const res = await fetch(`/api/price/rules/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to delete pricing rule');
    }
  }
}

export const priceCalculatorService = new PriceCalculatorService();
