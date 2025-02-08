import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [OrdersModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
