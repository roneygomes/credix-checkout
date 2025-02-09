import { Controller, Post } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { GetBuyerResponse } from '../credix/interfaces/responses.interface';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly credixClient: CredixClient,
  ) {}

  @Post('pre-checkout')
  async preCheckout(): Promise<GetBuyerResponse> {
    return await this.ordersService.checkout({
      id: uuidv4(),
      taxId: '26900161000125',
      amountCents: 100,
    });
  }
}
