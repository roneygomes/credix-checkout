import { Order } from './interfaces/order.interface';
import { v4 as uuidv4 } from 'uuid';
import { CredixClient } from '../credix/credix.client';
import { OrdersService } from './orders.service';
import { FinancingOption } from './interfaces/financing.interface';
import { Repository } from 'typeorm';
import { InventoryItem } from '../inventory/inventory.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

let order: Order = {
  id: uuidv4(),
  items: [
    {
      id: 1,
      amount: 10,
    },
  ],
  buyerTaxId: '00000000000000',
  sellerTaxId: '11111111111111',
  amountCents: 100,
};

const mockRepository = {
  findBy: jest.fn(),
};

const mockCredixClient = {
  getBuyer: jest.fn(),
  createOrer: jest.fn(),
};

describe('on pre-checkout', () => {
  let service: OrdersService;
  let repository: Repository<InventoryItem>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: CredixClient,
          useValue: mockCredixClient,
        },
        {
          provide: getRepositoryToken(InventoryItem),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    repository = module.get<Repository<InventoryItem>>(
      getRepositoryToken(InventoryItem),
    );
  });

  it('shout not include credipay when credit is insufficient', async () => {
    order.amountCents = 100;
    mockCredixClient.getBuyer = jest.fn().mockResolvedValue({
      availableCreditLimitAmountCents: 50,
    });

    let financingOptions = await service.preCheckout(order);

    expect(financingOptions.length).toBe(0);
  });

  it('should not include credipay when api call fails', async () => {
    mockCredixClient.getBuyer = jest.fn(() => {
      new Error('credix api call failed');
    });

    let financingOptions = await service.preCheckout(order);

    expect(financingOptions).toStrictEqual([]);
  });

  it('should not include credipay when our seller is missing from buyer profile', async () => {
    mockCredixClient.getBuyer = jest.fn().mockResolvedValue({
      sellerConfigs: [{ taxId: 'not our tax id' }],
    });

    let financingOptions = await service.preCheckout(order);

    expect(financingOptions).toStrictEqual([]);
  });

  it('should include credipay when buyer has credit', async () => {
    order.amountCents = 100;

    mockCredixClient.getBuyer = jest.fn().mockResolvedValue({
      availableCreditLimitAmountCents: 200,
      sellerConfigs: [
        { taxId: order.sellerTaxId, baseTransactionFeePercentage: 0.02 },
      ],
    });

    let financingOptions = await service.preCheckout(order);

    expect(financingOptions).toStrictEqual<FinancingOption[]>([
      {
        name: 'credix credipay',
        baseFee: 0.02,
      },
    ]);
  });
});
