import { Controller, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { v4 as uuidv4 } from 'uuid';
import { GetBuyerResponse } from 'src/credix/interfaces/responses.interface';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('/checkout')
  async checkout(): Promise<GetBuyerResponse> {
    return await this.ordersService.checkout({
      id: uuidv4(),
      taxId: '26900161000125',
      amountCents: 100,
    });
  }
}
