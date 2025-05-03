import { Module } from '@nestjs/common';

import { AIModule } from './ai/ai.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { CommonModule } from './config/common.module';
import { GithubModule } from './github/github.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60000,
      limit: 15,
    }),
    CommonModule,
    AIModule,
    GithubModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
