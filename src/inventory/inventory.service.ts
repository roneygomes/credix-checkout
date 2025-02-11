import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InventoryItem } from './inventory.entity';
import { Order } from '../orders/interfaces/order.interface';

@Injectable()
export class InventoryService {
  async updateInventory(order: Order, manager: EntityManager): Promise<void> {
    for (const { productId, quantity } of order.items) {
      if (quantity <= 0) {
        throw new Error('invalid order amount');
      }

      const result = await manager
        .createQueryBuilder()
        .update(InventoryItem)
        .set({ amount: () => `amount - ${quantity}` })
        .where('id = :productId AND amount >= :quantity', {
          productId,
          quantity,
        })
        .execute();

      if (result.affected === 0) {
        throw new Error('not enough items in inventory');
      }
    }
  }
}
