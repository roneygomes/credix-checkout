export type OptionName = 'CREDIX_CREDIPAY' | 'OTHER';

export interface FinancingOption {
  name: OptionName;
  baseFee: number;
  maxPaymentTermDays: number;
}
