import { Module } from '@nestjs/common';
import { DiscoveryModule, DiscoveryService } from '@nestjs/core';
import { RabbitMqService } from './rabbtmq.service';

@Module({
  imports: [DiscoveryModule],
  providers: [RabbitMqService],
  exports: [RabbitMqService],
  controllers: [],
})
export class RabbitMqModule {}
