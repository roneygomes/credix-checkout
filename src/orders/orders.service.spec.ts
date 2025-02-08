import { Test, TestingModule } from '@nestjs/testing';
import { Order } from './interfaces/order.interface';
import { v4 as uuidv4 } from 'uuid';
import { InsufficientCreditError } from './interfaces/errors.interface';
import { OrdersService } from './orders.service';

describe('checkout', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersService],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should throw an error when buyers credit is insufficient', async () => {
    let order: Order = {
      id: uuidv4(),
      taxId: '00000000000000',
      amountCents: 100,
    };

    try {
      service.checkout(order);
    } catch (error) {
      expect(error).toBeInstanceOf<InsufficientCreditError>(error);
    }
  });
});
