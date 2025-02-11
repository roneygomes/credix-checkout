import { CredixClient } from '../credix/credix.client';
import { FinancingOption } from './interfaces/financing.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService, OUR_SELLER_ID } from './orders.service';
import { DataSource } from 'typeorm';
import {
  Order,
  OrderSimulation,
  OrderSimulationResponse,
} from '../orders/interfaces/order.interface';
import { InventoryService } from '../inventory/inventory.service';
import { Buyer } from './interfaces/buyer.interface';

describe('orders service', () => {
  let service: OrdersService;
  let order: Order;

  let orderSimulation: OrderSimulation;
  let orderSimulationResponse: OrderSimulationResponse;

  let buyer: Buyer;

  let credixMock: {
    getBuyer: jest.Mock;
    createOrder: jest.Mock;
    simulateOrder: jest.Mock;
  };

  let queryMock: { execute: jest.Mock };
  let dataSourceMock: { transaction: jest.Mock };

  let rolledBack: boolean;

  beforeEach(async () => {
    rolledBack = false;
    order = {
      buyerTaxId: '26900161000125',
      sellerTaxId: OUR_SELLER_ID,
      subtotalAmountCents: 500000,
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
      estimatedDeliveryDateUTC: '2025-03-01T00:00:00Z',
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
          unitPriceCents: 300000,
        },
        {
          productId: '2',
          quantity: 2,
          productName: 'product',
          unitPriceCents: 200000,
        },
      ],
      installments: [
        {
          maturityDate: '2025-03-30T00:00:00Z',
          faceValueCents: 500000,
        },
      ],
    };

    orderSimulation = {
      sellerTaxId: OUR_SELLER_ID,
      buyerTaxId: '26900161000125',
      totalOrderAmountCents: 50000,
      maxNumberOfInstallments: 6,
      periodDuration: 30,
      paymentTerms: [30, 60, 90, 120],
    };

    buyer = {
      id: 'b7a686b0-6bbe-49bc-af2b-2c9d7ed35af1',
      taxId: '26900161000125',
      name: 'fictional buyer',
      sellerConfigs: [
        {
          taxId: OUR_SELLER_ID,
          maxPaymentTermDays: 70,
          monthlyDiscountRate: 0.02,
          transactionFeePercentage: 0.015,
          baseTransactionFeePercentage: 0.015,
        },
      ],
      creditLimitAmountCents: 100000000,
      availableCreditLimitAmountCents: 48270236,
      onboarded: false,
      eligible: true,
    };

    orderSimulationResponse = {
      maxPaymentTermDays: 70,
      totalOrderAmountCents: 50000,
      invoiceTotalsWithFees: [
        {
          totalInvoiceAmountCents: 50000,
          fees: {
            buyerFeesCents: 0,
            buyerFeesPercentage: 0,
          },
          paymentTermDays: 30,
        },
      ],
      installments: [
        [
          {
            maturityDate: '2025-03-30T16:04:32.655Z',
            faceValueCents: 50000,
          },
        ],
      ],
    };

    credixMock = {
      getBuyer: jest.fn().mockResolvedValue(buyer),
      createOrder: jest.fn().mockResolvedValue(orderSimulationResponse),
      simulateOrder: jest.fn().mockResolvedValue(orderSimulationResponse),
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
    it('should display NOT_ENOUGH_CREDIT when buyer has not enough credit', async () => {
      buyer.availableCreditLimitAmountCents = 0;
      let financingOptions = await service.simulateOrder(orderSimulation);
      expect(financingOptions).toStrictEqual([
        {
          name: 'CREDIX_CREDIPAY',
          simulation: 'NOT_ENOUGH_CREDIT',
        },
      ]);
    });

    it('should not include credipay when api call fails', async () => {
      credixMock.getBuyer = jest.fn(() => {
        throw new Error('bad gateway');
      });

      let financingOptions = await service.simulateOrder(orderSimulation);
      expect(financingOptions).toStrictEqual([
        {
          name: 'CREDIX_CREDIPAY',
          error: 'credipay request failed: bad gateway',
        },
      ]);
    });

    it('should not include credipay when our seller is missing from buyer profile', async () => {
      orderSimulation.totalOrderAmountCents = 100;
      buyer.sellerConfigs[0].taxId = 'not our tax id';

      let financingOptions = await service.simulateOrder(orderSimulation);

      expect(financingOptions).toStrictEqual([
        {
          name: 'CREDIX_CREDIPAY',
          simulation: 'CREDIPAY_NOT_AVAILABLE_FOR_BUYER',
        },
      ]);
    });

    it('should include credipay when buyer has credit', async () => {
      let financingOptions = await service.simulateOrder(orderSimulation);

      expect(financingOptions).toStrictEqual<FinancingOption[]>([
        {
          name: 'CREDIX_CREDIPAY',
          simulation: orderSimulationResponse,
        },
      ]);
    });
  });

  describe('checkout', () => {
    it('should decrease inventory count', async () => {
      await service.credixCheckout(order);

      expect(dataSourceMock.transaction).toHaveBeenCalled();
      expect(rolledBack).toBe(false);

      expect(credixMock.createOrder).toHaveBeenCalled();
      expect(queryMock.execute).toHaveBeenCalledTimes(order.items.length);
    });

    it('should fail when inventory is not updated', async () => {
      queryMock.execute = jest.fn().mockResolvedValue({ affected: 0 });
      expect.assertions(4);

      try {
        await service.credixCheckout(order);
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
        await service.credixCheckout(order);
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
        await service.credixCheckout(order);
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
        await service.credixCheckout(order);
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
        await service.credixCheckout(order);
      } catch (e) {
        expect(e).toBe(mockError);
      }

      expect(dataSourceMock.transaction).toHaveBeenCalled();
      expect(rolledBack).toBe(true);
      expect(credixMock.createOrder).toHaveBeenCalledTimes(0);
    });
  });
});
