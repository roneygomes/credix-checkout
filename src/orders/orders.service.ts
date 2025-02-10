import { Injectable } from '@nestjs/common';
import { Order } from './interfaces/order.interface';
import { CredixClient } from '../credix/credix.client';
import { FinancingOption } from './interfaces/financing.interface';
import { DataSource, EntityManager } from 'typeorm';
import { InventoryItem } from '../inventory/inventory.entity';
import {
  CreateOrderRequest,
  CreateOrderResponse,
} from 'src/credix/dto/credix.dto';
import { v4 as uuidv4 } from 'uuid';

export const OUR_SELLER_ID = '37154724000108';

@Injectable()
export class OrdersService {
  constructor(
    private credixClient: CredixClient,
    private dataSource: DataSource,
  ) {}

  async getFinancingOptions(
    buyerTaxId: string,
    amountCents: number,
  ): Promise<FinancingOption[]> {
    let financingOptions: FinancingOption[] = [];

    try {
      let buyer = await this.credixClient.getBuyer(buyerTaxId);

      if (amountCents < buyer.availableCreditLimitAmountCents) {
        let sellerConfig = buyer.sellerConfigs.find(
          (config) => config.taxId == OUR_SELLER_ID,
        );

        if (sellerConfig) {
          financingOptions.push({
            name: 'CREDIX_CREDIPAY',
            baseFee: sellerConfig.baseTransactionFeePercentage,
            maxPaymentTermDays: sellerConfig.maxPaymentTermDays,
          });
        }
      }
    } catch (e) {
      console.warn(`ignoring credix as a financing option; ${e}`);
    }

    return financingOptions;
  }

  async checkout(order: Order): Promise<CreateOrderResponse> {
    return await this.dataSource.transaction(async (entityManager) => {
      await this.updateInventory(order, entityManager);

      const request: CreateOrderRequest = {
        externalId: uuidv4(),
        subtotalAmountCents: order.cost.orderCostCents,
        taxAmountCents: order.cost.taxCostCents,
        shippingCostCents: order.cost.shippingCostCents,
        shippingLocation: order.shipping,
        estimatedDeliveryDateUTC: order.deliveryDate.toISOString(),
        contactInformation: order.contact,
      };

      return await this.credixClient.createOrder(request);
    });
  }

  // TODO: move this to inventory module
  private async updateInventory(
    order: Order,
    manager: EntityManager,
  ): Promise<void> {
    for (const { id, amount } of order.items) {
      if (amount <= 0) {
        throw new Error('invalid order amount');
      }

      const result = await manager
        .createQueryBuilder()
        .update(InventoryItem)
        .set({ amount: () => `amount - ${amount}` })
        .where('id = :id AND amount >= :amount', { id, amount })
        .execute();

      if (result.affected === 0) {
        throw new Error('not enough items in inventory');
      }
    }
  }
}
