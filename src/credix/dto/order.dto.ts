import {
  Installment,
  OrderStatus,
  ShippingLocation,
} from '../interfaces/order.interface';

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
