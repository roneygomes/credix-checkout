import { Order } from './interfaces/order.interface';
import { v4 as uuidv4 } from 'uuid';
import { CredixClient } from '../credix/credix.client';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from './orders.service';

let order: Order = {
  id: uuidv4(),
  taxId: '00000000000000',
  amountCents: 100,
};

let getBuyerResponse: any = {};
let getBuyerMock = jest.fn(() => getBuyerResponse);

jest.mock('../credix/credix.client', () => {
  return {
    CredixClient: jest.fn().mockImplementation(() => {
      return {
        getBuyer: getBuyerMock,
      };
    }),
  };
});

const mockedCredixClient = jest.mocked(CredixClient);

describe('on pre-checkout', () => {
  let service: OrdersService;

  beforeEach(async () => {
    mockedCredixClient.mockClear();

    let credixClient = new CredixClient(new ConfigService());
    service = new OrdersService(credixClient);
  });

  it('credipay is not included when credit is insufficient', async () => {
    getBuyerResponse.creditLimitAmountCents = 200;
    getBuyerResponse.availableCreditLimitAmountCents = 50;

    let financingOptions = await service.preCheckout(order);

    expect(financingOptions.length).toBe(0);
  });

  it('credipay is not included when api call fails', async () => {
    getBuyerMock = jest.fn(() => {
      throw new Error('credix api call failed');
    });

    let financingOptions = await service.preCheckout(order);

    expect(financingOptions.length).toBe(0);
  });
});
