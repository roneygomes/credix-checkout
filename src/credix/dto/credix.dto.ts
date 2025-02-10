import {
  ContactInformation,
  Installment,
  OrderStatus,
  ShippingLocation,
} from '../../orders/interfaces/order.interface';

export interface SellerConfig {
  taxId: string;
  maxPaymentTermDays: number;
  monthlyDiscountRate: number;
  transactionFeePercentage: number;
  baseTransactionFeePercentage: number;
  variableTransactionFeeIntervalDays: number;
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

export interface CreateOrderRequest {
  externalId: string;
  subtotalAmountCents: number;
  taxAmountCents: number;
  shippingCostCents: number;
  shippingLocation: ShippingLocation;
  estimatedDeliveryDateUTC: string;
  contactInformation: ContactInformation;
}

export interface CreateOrderResponse {
  id: string;
  externalId: string;
  subtotalAmountCents: number;
  taxAmountCents: number;
  shippingCostCents: number;
  buyerFeesCents: number;
  totalAmountCents: number;
  shippingLocation: ShippingLocation;
  paymentTermDays: number;
  status: OrderStatus;
  estimatedDeliveryDate: string;
  createdAt: string;
  sellerTaxId: string;
  buyerTaxId: string;
  noAdvancing: boolean;
  installments: Installment[];
}
