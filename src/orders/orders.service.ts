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

  async simulateOrder(simulation: OrderSimulation): Promise<FinancingOption[]> {
    let financingOptions: FinancingOption[] = [];

    try {
      let buyer = await this.credixClient.getBuyer(simulation.buyerTaxId);

      if (
        simulation.totalOrderAmountCents > buyer.availableCreditLimitAmountCents
      ) {
        financingOptions.push({
          name: 'CREDIX_CREDIPAY',
          simulation: 'NOT_ENOUGH_CREDIT',
        });
      }

      if (
        simulation.totalOrderAmountCents < buyer.availableCreditLimitAmountCents
      ) {
        let sellerConfig = buyer.sellerConfigs.find(
          (config) => config.taxId == OUR_SELLER_ID,
        );

        if (sellerConfig) {
          const response = await this.credixClient.simulateOrder(simulation);

          financingOptions.push({
            name: 'CREDIX_CREDIPAY',
            simulation: response,
          });
        }
      }
    } catch (e) {
      financingOptions.push({
        name: 'CREDIX_CREDIPAY',
        error: `credipay request failed: ${(e as Error).message}`,
      });
    }

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
