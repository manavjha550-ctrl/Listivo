export interface PricingCalculationInput {
  productCost: number;
  sellingPrice: number;
  mrp: number;
  discountPercent?: number;
  gstRate: number;
  packagingCost: number;
  shippingCost: number;
  marketplaceFee: number;
  marketplaceFeePercent: number;
  otherExpenses: number;
  targetProfitAmount?: number;
  targetProfitMarginPercent?: number;
}

export interface TargetProfitCalculations {
  requiredSellingPrice: number;
  differenceFromCurrent: number;
  estimatedProfitAtNewPrice: number;
  estimatedMargin: number;
}

export interface PricingCalculationResult {
  mrp: number;
  discountAmount: number;
  discountPercent: number;
  sellingPrice: number;
  gstRate: number;
  gstAmount: number;
  marketplaceFee: number;
  packagingCost: number;
  shippingCost: number;
  otherExpenses: number;
  totalCost: number;
  estimatedSettlement: number;
  estimatedProfit: number;
  profitMarginPercent: number;
  breakEvenSellingPrice: number;
  isEstimated: boolean;
  targetCalculations?: TargetProfitCalculations | null;
}

export interface PricingRule {
  id: string;
  userId: string;
  name: string;
  gstRate: number;
  packagingCost: number;
  shippingCost: number;
  marketplaceFee: number;
  marketplaceFeePercent: number;
  targetMargin: number;
  createdAt: string;
  updatedAt: string;
}

export interface BulkCalculatorItem {
  id: string;
  title: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  mrp: number;
  gstRate?: number;
  packagingCost?: number;
  shippingCost?: number;
  marketplaceFee?: number;
  marketplaceFeePercent?: number;
}

export interface BulkCalculatedResultItem {
  productId: string;
  title: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  mrp: number;
  gstRate: number;
  estimatedProfit: number;
  profitMarginPercent: number;
  estimatedSettlement: number;
  breakEvenSellingPrice: number;
  status: 'PROFITABLE' | 'LOW_MARGIN' | 'LOSS_MAKING' | 'INVALID';
  details: PricingCalculationResult;
}
