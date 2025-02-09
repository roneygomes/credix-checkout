export interface Order {
  id: string;
  buyerTaxId: string;
  sellerTaxId?: string;
  amountCents: number;
}
