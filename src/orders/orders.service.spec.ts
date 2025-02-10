import { CredixClient } from '../credix/credix.client';
import { FinancingOption } from './interfaces/financing.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService, OUR_SELLER_ID } from './orders.service';
import { DataSource } from 'typeorm';
import { Order } from '../credix/interfaces/order.interface';
import { InventoryService } from '../inventory/inventory.service';

describe('orders service', () => {
  let service: OrdersService;
  let order: Order;

  let credixMock: {
    getBuyer: jest.Mock;
    createOrder: jest.Mock;
  };

  let queryMock: { execute: jest.Mock };
  let dataSourceMock: { transaction: jest.Mock };

  let rolledBack: boolean;

  beforeEach(async () => {
    rolledBack = false;
    order = {
      buyerTaxId: '26900161000125',
      sellerTaxId: OUR_SELLER_ID,
      subtotalAmountCents: 100,
      taxAmountCents: 2,
      shippingCostCents: 10,
      shippingLocation: {
        address1: 'Rua da Consolação, 930',
        address2: 'Apto 101',
        city: 'São Paulo',
        region: 'São Paulo',
        postalCode: '01302000',
        country: 'Brazil',
      },
      estimatedDeliveryDateUTC: '2024-02-05T00:00:00Z',
      contactInformation: {
        email: 'sales@acme.com',
        phone: '+551243974164',
        name: 'First name',
        lastName: 'Last name',
      },
      items: [
        {
          productId: '1',
          quantity: 2,
          productName: 'product',
          unitPriceCents: 10,
        },
        {
          productId: '2',
          quantity: 2,
          productName: 'product',
          unitPriceCents: 10,
        },
      ],
      installments: [
        {
          maturityDate: '2024-02-10T00:00:00Z',
          faceValueCents: 100,
        },
      ],
    };

    credixMock = {
      getBuyer: jest.fn(),
      createOrder: jest.fn(),
    };

    queryMock = {
      execute: jest.fn().mockResolvedValue({
        affected: order.items.length,
      }),
    };

    const entityManagerMock = {
      createQueryBuilder: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue({
          set: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue(queryMock),
          }),
        }),
      }),
    };

    dataSourceMock = {
      transaction: jest.fn(async (callback) => {
        try {
          await callback(entityManagerMock);
        } catch (e) {
          rolledBack = true;
          throw e;
        }
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        InventoryService,
        {
          provide: CredixClient,
          useValue: credixMock,
        },
        {
          provide: DataSource,
          useValue: dataSourceMock,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('pre-checkout', () => {
    it('shout not include credipay when credit is insufficient', async () => {
      order.subtotalAmountCents = 100;
      credixMock.getBuyer = jest.fn().mockResolvedValue({
        availableCreditLimitAmountCents: 50,
      });

      let financingOptions = await service.getFinancingOptions(
        order.buyerTaxId,
        order.subtotalAmountCents,
      );
      expect(financingOptions.length).toBe(0);
    });

    it('should not include credipay when api call fails', async () => {
      credixMock.getBuyer = jest.fn(() => {
        throw new Error('bad gateway');
      });

      let financingOptions = await service.getFinancingOptions(
        order.buyerTaxId,
        order.subtotalAmountCents,
      );
      expect(financingOptions).toStrictEqual([]);
    });

    it('should not include credipay when our seller is missing from buyer profile', async () => {
      order.subtotalAmountCents = 100;

      credixMock.getBuyer = jest.fn().mockResolvedValue({
        availableCreditLimitAmountCents: 200,
        sellerConfigs: [{ taxId: 'not our tax id' }],
      });

      let financingOptions = await service.getFinancingOptions(
        order.buyerTaxId,
        order.subtotalAmountCents,
      );
      expect(financingOptions).toStrictEqual([]);
    });

    it('should include credipay when buyer has credit', async () => {
      order.subtotalAmountCents = 100;
      credixMock.getBuyer = jest.fn().mockResolvedValue({
        availableCreditLimitAmountCents: 200,
        sellerConfigs: [
          {
            taxId: OUR_SELLER_ID,
            baseTransactionFeePercentage: 0.02,
            maxPaymentTermDays: 30,
          },
        ],
      });

      let financingOptions = await service.getFinancingOptions(
        order.buyerTaxId,
        order.subtotalAmountCents,
      );

      expect(financingOptions).toStrictEqual<FinancingOption[]>([
        {
          name: 'CREDIX_CREDIPAY',
          baseFee: 0.02,
          maxPaymentTermDays: 30,
        },
      ]);
    });
  });

  describe('checkout', () => {
    it('should decrease inventory count', async () => {
      await service.checkout(order);

      expect(dataSourceMock.transaction).toHaveBeenCalled();
      expect(rolledBack).toBe(false);

      expect(credixMock.createOrder).toHaveBeenCalled();
      expect(queryMock.execute).toHaveBeenCalledTimes(order.items.length);
    });

    it('should fail when inventory is not updated', async () => {
      queryMock.execute = jest.fn().mockResolvedValue({ affected: 0 });
      expect.assertions(4);

      try {
        await service.checkout(order);
      } catch (e) {
        expect((e as Error).message).toMatch('not enough items in inventory');
      }

      expect(dataSourceMock.transaction).toHaveBeenCalled();
      expect(rolledBack).toBe(true);
      expect(credixMock.createOrder).toHaveBeenCalledTimes(0);
    });

    it('should fail when order amount is zero', async () => {
      order.items[0].quantity = 0;
      expect.assertions(5);

      try {
        await service.checkout(order);
      } catch (error) {
        expect((error as Error).message).toMatch('invalid order amount');
      }

      expect(dataSourceMock.transaction).toHaveBeenCalled();
      expect(rolledBack).toBe(true);

      expect(credixMock.createOrder).toHaveBeenCalledTimes(0);
      expect(queryMock.execute).toHaveBeenCalledTimes(0);
    });

    it('should fail when order amount is negative', async () => {
      order.items[0].quantity = -1;
      expect.assertions(5);

      try {
        await service.checkout(order);
      } catch (error) {
        expect((error as Error).message).toMatch('invalid order amount');
      }

      expect(dataSourceMock.transaction).toHaveBeenCalled();
      expect(rolledBack).toBe(true);

      expect(credixMock.createOrder).toHaveBeenCalledTimes(0);
      expect(queryMock.execute).toHaveBeenCalledTimes(0);
    });

    it('should fail when credix api call fails', async () => {
      const mockError = new Error('credix api error');
      credixMock.createOrder = jest.fn().mockRejectedValue(mockError);

      expect.assertions(4);

      try {
        await service.checkout(order);
      } catch (e) {
        expect(e).toBe(mockError);
      }

      expect(dataSourceMock.transaction).toHaveBeenCalled();
      expect(rolledBack).toBe(true);
      expect(queryMock.execute).toHaveBeenCalledTimes(order.items.length);
    });

    it('should fail when repository call fails', async () => {
      const mockError = new Error('database error');
      queryMock.execute = jest.fn().mockRejectedValue(mockError);

      expect.assertions(4);

      try {
        await service.checkout(order);
      } catch (e) {
        expect(e).toBe(mockError);
      }

      expect(dataSourceMock.transaction).toHaveBeenCalled();
      expect(rolledBack).toBe(true);
      expect(credixMock.createOrder).toHaveBeenCalledTimes(0);
    });
  });
});
