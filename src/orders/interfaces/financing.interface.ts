import { OrderSimulationResponse } from './order.interface';

export interface FinancingOption {
  name: 'CREDIX_CREDIPAY' | 'FICTIONAL_BANK';
  simulation?: 'NOT_ENOUGH_CREDIT' | OrderSimulationResponse;
  error?: string;
}
