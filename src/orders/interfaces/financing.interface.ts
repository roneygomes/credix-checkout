import { OrderSimulationResponse } from './order.interface';

export interface FinancingOption {
  name: 'CREDIX_CREDIPAY' | 'FICTIONAL_BANK';
  simulation?:
    | 'NOT_ENOUGH_CREDIT'
    | 'CREDIPAY_NOT_AVAILABLE_FOR_BUYER'
    | OrderSimulationResponse;
  error?: string;
}
