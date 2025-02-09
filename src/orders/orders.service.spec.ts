import { Order } from './interfaces/order.interface';
import { v4 as uuidv4 } from 'uuid';
import { CredixClient } from '../credix/credix.client';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from './orders.service';

let getBuyerResponse: any = {};

jest.mock('../credix/credix.client', () => {
  return {
    CredixClient: jest.fn().mockImplementation(() => {
      return {
        getBuyer: jest.fn(() => getBuyerResponse),
      };
    }),
  };
});

const mockedCredixClient = jest.mocked(CredixClient);

describe('checkout', () => {
  let service: OrdersService;

  beforeEach(async () => {
    mockedCredixClient.mockClear();

    let credixClient = new CredixClient(new ConfigService());
    service = new OrdersService(credixClient);
  });

  it('should throw an error when buyers credit is insufficient', async () => {
    let order: Order = {
      id: uuidv4(),
      taxId: '00000000000000',
      amountCents: 100,
    };

    getBuyerResponse.creditLimitAmountCents = 200;
    getBuyerResponse.availableCreditLimitAmountCents = 50;

    expect.assertions(1);

    try {
      await service.checkout(order);
    } catch (e) {
      expect((e as Error).message).toMatch('not enough credit available');
    }
  });
});
