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
  maturityDate: Date;
  faceValueCents: number;
}

export interface OrderItem {
  id: number;
  amount: number;
}

export interface Cost {
  shippingCostCents: number;
  orderCostCents: number;
  taxCostCents: number;
}

export interface Order {
  id: string;
  buyerTaxId: string;
  cost: Cost;
  shipping: ShippingLocation;
  deliveryDate: Date;
  contact: ContactInformation;
  items: OrderItem[];
  installments: Installment[];
}
