import { Injectable } from '@nestjs/common';
import { Order } from '../credix/interfaces/order.interface';
import { CreateOrderResponse } from '../credix/dto/order.dto';
import { CredixClient } from '../credix/credix.client';
import { FinancingOption } from './interfaces/financing.interface';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { InventoryService } from '../inventory/inventory.service';

export const OUR_SELLER_ID = '37154724000108';

@Injectable()
export class OrdersService {
  constructor(
    private credixClient: CredixClient,
    private inventoryService: InventoryService,
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
      await this.inventoryService.updateInventory(order, entityManager);

      order.sellerTaxId = OUR_SELLER_ID;
      order.externalId = uuidv4();

      return await this.credixClient.createOrder(order);
    });
  }
}
