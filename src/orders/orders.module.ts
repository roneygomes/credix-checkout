import { Module } from '@nestjs/common';
import { CredixModule } from 'src/credix/credix.module';
import { CredixClient } from 'src/credix/credix.client';
import { OrdersController } from './orders.controller';
import { ConfigModule } from '@nestjs/config';
import { OrdersService } from './orders.service';
import { InventoryModule } from 'src/inventory/inventory.module';
import { InventoryService } from 'src/inventory/inventory.service';

@Module({
  imports: [CredixModule, ConfigModule, InventoryModule],
  controllers: [OrdersController],
  providers: [OrdersService, CredixClient, InventoryService],
})
export class OrdersModule {}
