import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { FinancingOption } from './interfaces/financing.interface';
import { GetFinancingOptionsDto } from './dto/get-financing-options.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('financing')
  async preCheckout(
    @Query(new ValidationPipe({ transform: true }))
    query: GetFinancingOptionsDto,
  ): Promise<FinancingOption[]> {
    return await this.ordersService.getFinancingOptions(
      query.buyerId,
      query.amount,
    );
  }
}
