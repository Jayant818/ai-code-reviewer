import { Module } from '@nestjs/common';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';
import { AIModule } from 'src/ai/ai.module';

@Module({
  imports: [AIModule],
  controllers: [GithubController],
  providers: [GithubService],
  exports: [],
})
export class GithubModule {}
