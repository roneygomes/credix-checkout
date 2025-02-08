export interface GetBuyerResponse {
  id: string;
  taxId: string;
  name: string;
  sellerConfigs: {
    taxId: string;
    maxPaymentTermDays: number;
    monthlyDiscountRate: number;
    transactionFeePercentage: number;
    baseTransactionFeePercentage: number;
    variableTransactionFeeIntervalDays: number;
  }[];
  creditLimitAmountCents: number;
  availableCreditLimitAmountCents: number;
  onboarded: boolean;
  eligible: boolean;
}
