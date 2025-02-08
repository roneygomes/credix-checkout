import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Order } from './interfaces/order.interface';

@Injectable()
export class OrdersService {
  findAll(): Order[] {
    return [
      {
        id: uuidv4(),
      },
      {
        id: uuidv4(),
      },
    ];
  }
}
