import { Injectable } from '@nestjs/common';
import { Order } from './interfaces/order.interface';
import { CredixClient } from '../credix/credix.client';
import { GetBuyerResponse } from '../credix/interfaces/responses.interface';

@Injectable()
export class OrdersService {
  constructor(private credixClient: CredixClient) {}

  async checkout(order: Order): Promise<GetBuyerResponse> {
    let buyer = await this.credixClient.getBuyer(order.taxId);

    if (order.amountCents > buyer.availableCreditLimitAmountCents) {
      throw new Error('not enough credit available');
    }

    return buyer;
  }
}
