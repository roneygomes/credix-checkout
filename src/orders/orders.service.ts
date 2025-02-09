import { Injectable } from '@nestjs/common';
import { Order } from './interfaces/order.interface';
import { CredixClient } from '../credix/credix.client';
import { GetBuyerResponse } from '../credix/interfaces/responses.interface';
import { FinancingOption } from './interfaces/financing.interface';
import { In, Repository } from 'typeorm';
import { InventoryItem } from '../inventory/inventory.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OrdersService {
  constructor(
    private credixClient: CredixClient,
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
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
    } catch (e) {}

    return financingOptions;
  }

  async checkout(order: Order): Promise<GetBuyerResponse> {
    let amountMap = new Map<number, number>(
      order.items.map((i) => [i.id, i.amount]),
    );

    let items = await this.inventoryRepository.findBy({
      id: In([...amountMap.keys()]),
    });

    items.forEach((i) => {
      i.amount = i.amount - amountMap.get(i.id)!;
    });

    let buyer = await this.credixClient.getBuyer(order.buyerTaxId);

    if (order.amountCents > buyer.availableCreditLimitAmountCents) {
      throw new Error('not enough credit available');
    }

    return buyer;
  }
}
