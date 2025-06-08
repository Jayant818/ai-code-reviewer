import { Module } from '@nestjs/common';

import { AIModule } from './ai/ai.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { GithubModule } from './github/github.module';
import { IntegrationModule } from './Integrations/Integration.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from '@app/common';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60000,
      limit: 15,
    }),
    CommonModule,
    AIModule,
    GithubModule,
    IntegrationModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
