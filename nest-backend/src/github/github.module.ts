import { Module } from '@nestjs/common';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';
import { AIModule } from 'src/ai/ai.module';
import { IntegrationModule } from 'src/Integrations/Integration.module';
import { OrganizationModule } from 'src/organization/organization.module';
import { UserModule } from 'src/user/user.module';
import { ReviewModule } from 'src/reviews/review.module';

@Module({
  imports: [AIModule,IntegrationModule,OrganizationModule,UserModule,ReviewModule],
  controllers: [GithubController],
  providers: [GithubService],
  exports: [],
})
export class GithubModule {}
