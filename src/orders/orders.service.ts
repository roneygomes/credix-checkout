import { Injectable } from '@nestjs/common';
import { Order } from './interfaces/order.interface';
import { CredixClient } from 'src/credix/credix.client';
import { GetBuyerResponse } from 'src/credix/interfaces/responses.interface';

@Injectable()
export class OrdersService {
  constructor(private credixClient: CredixClient) {}

  async checkout(order: Order): Promise<GetBuyerResponse> {
    return await this.credixClient.getBuyer(order.taxId);
  }
}
