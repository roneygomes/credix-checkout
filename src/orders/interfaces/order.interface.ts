import { IsArray, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export interface Order {
  externalId?: string;
  sellerTaxId: string;
  buyerTaxId: string;
  subtotalAmountCents: number;
  taxAmountCents: number;
  shippingCostCents: number;
  shippingLocation: ShippingLocation;
  estimatedDeliveryDateUTC?: string;
  contactInformation: ContactInformation;
  items: Item[];
  installments: Installment[];
  metadata?: any;
}

export class OrderSimulation {
  @IsString()
  @IsNotEmpty()
  sellerTaxId: string;

  @IsString()
  @IsNotEmpty()
  buyerTaxId: string;

  @IsNumber()
  @Min(1)
  totalOrderAmountCents: number;

  @IsNumber()
  @Min(1)
  maxNumberOfInstallments: number;

  @IsNumber()
  @Min(1)
  periodDuration: number;

  @IsArray()
  paymentTerms: number[];
}

export interface ShippingLocation {
  address1: string;
  address2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

export interface ContactInformation {
  email: string;
  phone: string;
  name: string;
  lastName: string;
}

export type OrderStatus =
  | 'new'
  | 'created'
  | 'accepted'
  | 'cancelled'
  | 'rejected'
  | 'finalized'
  | 'captured'
  | 'expired'
  | 'ineligible'
  | 'invalidated';

export interface Installment {
  maturityDate: string;
  faceValueCents: number;
}

export interface Item {
  productId: string;
  productName: string;
  quantity: number;
  unitPriceCents: number;
}

export interface OrderSimulationResponse {
  maxPaymentTermDays: number;
  totalOrderAmountCents: number;
  invoiceTotalsWithFees: {
    totalInvoiceAmountCents: number;
    fees: {
      buyerFeesCents: number;
      buyerFeesPercentage: number;
    };
    paymentTermDays: number;
  }[];
  installments: Installment[][];
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
