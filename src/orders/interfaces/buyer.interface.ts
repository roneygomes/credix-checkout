export interface SellerConfig {
  taxId: string;
  maxPaymentTermDays: number;
  monthlyDiscountRate: number;
  transactionFeePercentage: number;
  baseTransactionFeePercentage: number;
  variableTransactionFeeIntervalDays: number;
}

export interface Buyer {
  id: string;
  taxId: string;
  name: string;
  sellerConfigs: SellerConfig[];
  creditLimitAmountCents: number;
  availableCreditLimitAmountCents: number;
  onboarded: boolean;
  eligible: boolean;
}

export interface GetBuyerResponse {
  id: string;
  taxId: string;
  name: string;
  sellerConfigs: SellerConfig[];
  creditLimitAmountCents: number;
  availableCreditLimitAmountCents: number;
  onboarded: boolean;
  eligible: boolean;
}
