export interface Order {
  id: string;
  items: {
    id: number;
    amount: number;
  }[];
  buyerTaxId: string;
  sellerTaxId?: string;
  amountCents: number;
}
