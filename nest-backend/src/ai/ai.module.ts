import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { AIFactory } from './ai.factory';
import { GeminiStrategy } from './strategies/gemini.strategy';

@Module({
  imports: [],
  controllers: [AIController],
  providers: [AIService, AIFactory, GeminiStrategy],
  exports: [AIService],
})
export class AIModule {}
