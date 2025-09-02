import { Module } from '@nestjs/common';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';
import { AIModule } from 'src/ai/ai.module';
import { IntegrationModule } from 'src/Integrations/Integration.module';
import { OrganizationModule } from 'src/organization/organization.module';
import { UserModule } from 'src/user/user.module';
import { ReviewModule } from 'src/reviews/review.module';
import { GithubConsumer } from './github.consumer';
import { RabbitMqModule, RabbitMqService } from '@app/rabbitMq';
import { GithubFileConsumer } from './gitub-file.consumer';

@Module({
  imports: [AIModule,IntegrationModule,OrganizationModule,UserModule,ReviewModule,RabbitMqModule],
  controllers: [GithubController,GithubConsumer,GithubFileConsumer],
  providers: [GithubService],
  exports: [],
})
export class GithubModule {}
