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
