import { Injectable } from '@nestjs/common';
import { Order } from './interfaces/order.interface';
import { CredixClient } from '../credix/credix.client';
import { FinancingOption } from './interfaces/financing.interface';
import { DataSource, EntityManager } from 'typeorm';
import { InventoryItem } from '../inventory/inventory.entity';

@Injectable()
export class OrdersService {
  constructor(
    private credixClient: CredixClient,
    private dataSource: DataSource,
  ) {}

  async preCheckout(order: Order): Promise<FinancingOption[]> {
    let financingOptions: FinancingOption[] = [];

    try {
      let buyer = await this.credixClient.getBuyer(order.buyerTaxId);

      if (order.amountCents < buyer.availableCreditLimitAmountCents) {
        let sellerConfig = buyer.sellerConfigs.find(
          (config) => config.taxId == order.sellerTaxId,
        );

        if (sellerConfig) {
          financingOptions.push({
            name: 'credix credipay',
            baseFee: sellerConfig.baseTransactionFeePercentage,
          });
        }
      }
    } catch (e) {
      console.warn(`ignoring credix as a financing option; ${e}`);
    }

    return financingOptions;
  }

  async checkout(order: Order): Promise<void> {
    await this.dataSource.transaction(async (entityManager) => {
      await this.updateIventory(order, entityManager);
      await this.credixClient.createOrder({});
    });
  }

  private async updateIventory(
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
