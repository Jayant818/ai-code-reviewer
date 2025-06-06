import { Module } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

@Module({
  imports: [],
  providers: [DiscoveryService],
  exports: [],
  controllers: [],
})
export class RabbitMqModule {}
