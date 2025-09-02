import { Module } from '@nestjs/common';

import { AIModule } from './ai/ai.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { GithubModule } from './github/github.module';
import { IntegrationModule } from './Integrations/Integration.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from '@app/common';
import { OrganizationModule } from './organization/organization.module';
import { ReviewModule } from './reviews/review.module';
import { PaymentModule } from './payments/payments.module';

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
    OrganizationModule,
    ReviewModule,
    PaymentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
