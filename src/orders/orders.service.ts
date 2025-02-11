import { Injectable } from '@nestjs/common';
import { CredixClient } from '../credix/credix.client';
import { FinancingOption } from './interfaces/financing.interface';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { InventoryService } from '../inventory/inventory.service';
import {
  CreateOrderResponse,
  Order,
  OrderSimulation,
} from './interfaces/order.interface';

export const OUR_SELLER_ID = '37154724000108';

@Injectable()
export class OrdersService {
  constructor(
    private credixClient: CredixClient,
    private inventoryService: InventoryService,
    private dataSource: DataSource,
  ) {}

  private async credixSimulation(
    simulation: OrderSimulation,
  ): Promise<FinancingOption> {
    try {
      const buyer = await this.credixClient.getBuyer(simulation.buyerTaxId);

      if (
        simulation.totalOrderAmountCents > buyer.availableCreditLimitAmountCents
      ) {
        return {
          name: 'CREDIX_CREDIPAY',
          simulation: 'NOT_ENOUGH_CREDIT',
        };
      }

      let sellerConfig = buyer.sellerConfigs.find(
        (config) => config.taxId == OUR_SELLER_ID,
      );

      if (sellerConfig) {
        const response = await this.credixClient.simulateOrder(simulation);

        return {
          name: 'CREDIX_CREDIPAY',
          simulation: response,
        };
      }

      return {
        name: 'CREDIX_CREDIPAY',
        simulation: 'CREDIPAY_NOT_AVAILABLE_FOR_BUYER',
      };
    } catch (e) {
      return {
        name: 'CREDIX_CREDIPAY',
        error: `credipay request failed: ${(e as Error).message}`,
      };
    }
  }

  async simulateOrder(simulation: OrderSimulation): Promise<FinancingOption[]> {
    const financingOptions: FinancingOption[] = [];

    // The idea is to allow for multiple credit providers beyond Credix.
    const crediPay = await this.credixSimulation(simulation);
    financingOptions.push(crediPay);

    // We return all financing options and let the user decide which to use for checkout.
    return financingOptions;
  }

  async credixCheckout(order: Order): Promise<CreateOrderResponse> {
    return await this.dataSource.transaction(async (entityManager) => {
      await this.inventoryService.updateInventory(order, entityManager);

      order.sellerTaxId = OUR_SELLER_ID;
      order.externalId = uuidv4();

      return await this.credixClient.createOrder(order);
    });
  }
}
