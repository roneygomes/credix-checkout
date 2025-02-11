import { Body, Controller, Get, Post, ValidationPipe } from '@nestjs/common';
import { PreCheckoutResponse } from './dto/pre-checkout.dto';
import { OrdersService } from './orders.service';
import {
  CreateOrderResponse,
  Order,
  OrderSimulation,
} from './interfaces/order.interface';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('pre-checkout')
  async preCheckout(
    @Body(new ValidationPipe()) simulation: OrderSimulation,
  ): Promise<PreCheckoutResponse> {
    const financingOptions = await this.ordersService.simulateOrder(simulation);

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
