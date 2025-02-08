import { Module } from '@nestjs/common';
import { CredixClient } from './credix.client';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [CredixClient],
  imports: [ConfigModule],
  exports: [CredixClient],
})
export class CredixModule {}
