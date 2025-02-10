import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  CheckoutRequestBody,
  PreCheckoutQueryParams,
  PreCheckoutResponse,
  toOrder,
} from './dto/orders.dto';
import {
  ContactInformation,
  Cost,
  Order,
  OrderItem,
  ShippingLocation,
} from './interfaces/order.interface';
import { OrdersService } from './orders.service';
import { CreateOrderResponse } from 'src/credix/dto/credix.dto';

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

  @Post('checkout')
  async checkout(
    @Body(new ValidationPipe())
    body: CheckoutRequestBody,
  ): Promise<void> {
    const order = toOrder(body);
    console.log(order);
    await this.ordersService.checkout(order);
  }
}
