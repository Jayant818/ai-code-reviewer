import { Module } from '@nestjs/common';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';
import { AIModule } from 'src/ai/ai.module';
import { IntegrationModule } from 'src/Integrations/Integration.module';

@Module({
  imports: [AIModule,IntegrationModule],
  controllers: [GithubController],
  providers: [GithubService],
  exports: [],
})
export class GithubModule {}
