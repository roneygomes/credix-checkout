import { Injectable } from '@nestjs/common';
import { Order } from './interfaces/order.interface';
import { CredixClient } from '../credix/credix.client';
import { GetBuyerResponse } from '../credix/interfaces/responses.interface';
import { FinancingOption } from './interfaces/financing.interface';

@Injectable()
export class OrdersService {
  constructor(private credixClient: CredixClient) {}

  async preCheckout(order: Order): Promise<FinancingOption[]> {
    let financingOptions: FinancingOption[] = [];
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

    return financingOptions;
  }

  async checkout(order: Order): Promise<GetBuyerResponse> {
    let buyer = await this.credixClient.getBuyer(order.buyerTaxId);

    if (order.amountCents > buyer.availableCreditLimitAmountCents) {
      throw new Error('not enough credit available');
    }

    return buyer;
  }
}
