import { Order } from './interfaces/order.interface';
import { v4 as uuidv4 } from 'uuid';
import { CredixClient } from '../credix/credix.client';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from './orders.service';
import { FinancingOption } from './interfaces/financing.interface';

let order: Order;
let getBuyerResponse: any;
let getBuyerMock: any;

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

  beforeEach(() => {
    mockedCredixClient.mockClear();

    order = {
      id: uuidv4(),
      buyerTaxId: '00000000000000',
      sellerTaxId: '11111111111111',
      amountCents: 100,
    };

    getBuyerResponse = {};
    getBuyerMock = jest.fn(() => getBuyerResponse);

    let credixClient = new CredixClient(new ConfigService());
    service = new OrdersService(credixClient);
  });

  it('shout not include credipay when credit is insufficient', async () => {
    order.amountCents = 100;
    getBuyerResponse.availableCreditLimitAmountCents = 50;

    let financingOptions = await service.preCheckout(order);

    expect(financingOptions.length).toBe(0);
  });

  it('should not include credipay when api call fails', async () => {
    getBuyerMock = jest.fn(() => {
      throw new Error('credix api call failed');
    });

    let financingOptions = await service.preCheckout(order);

    expect(financingOptions).toStrictEqual([]);
  });

  it('should not include credipay when our seller is missing from buyer profile', async () => {
    getBuyerResponse.sellerConfigs = [
      {
        taxId: 'not our tax id',
      },
    ];

    let financingOptions = await service.preCheckout(order);

    expect(financingOptions).toStrictEqual([]);
  });

  it('should include credipay when buyer has credit', async () => {
    order.amountCents = 100;

    getBuyerResponse.availableCreditLimitAmountCents = 200;
    getBuyerResponse.sellerConfigs = [
      {
        taxId: order.sellerTaxId,
        baseTransactionFeePercentage: 0.02,
      },
    ];

    let financingOptions = await service.preCheckout(order);

    expect(financingOptions).toStrictEqual<FinancingOption[]>([
      {
        name: 'credix credipay',
        baseFee: 0.02,
      },
    ]);
  });
});
