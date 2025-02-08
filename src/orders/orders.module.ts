import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CredixModule } from 'src/credix/credix.module';
import { CredixClient } from 'src/credix/credix.client';
import { OrdersController } from './orders.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [CredixModule, ConfigModule],
  controllers: [OrdersController],
  providers: [OrdersService, CredixClient],
})
export class OrdersModule {}
