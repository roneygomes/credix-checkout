import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  PreCheckoutQueryParams,
  PreCheckoutResponse,
} from './dto/pre-checkout.dto';
import { OrdersService } from './orders.service';
import { Order } from '../credix/interfaces/order.interface';
import { CreateOrderResponse } from '../credix/dto/order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('pre-checkout')
  async preCheckout(
    @Query(new ValidationPipe({ transform: true }))
    query: PreCheckoutQueryParams,
  ): Promise<PreCheckoutResponse> {
    const financingOptions = await this.ordersService.getFinancingOptions(
      query.buyerId,
      query.amount,
    );

    return { financingOptions };
  }

  @Post('checkout/credix')
  async credixCheckout(
    @Body(new ValidationPipe())
    order: Order,
  ): Promise<CreateOrderResponse> {
    return await this.ordersService.credixCheckout(order);
  }
}
