import { Body, Post } from '@nestjs/common';
import { AppController } from 'lib/framework/src/decorators';
import { AIService } from './ai.service';
import { PostCodeReviewDTO } from './DTO/post-code-review-dto';
import { PostCodeSummaryDTO } from './DTO/post-code-summary.dto';

@AppController('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('review')
  async getCodeReview(@Body() { code, provider }: PostCodeReviewDTO) {
    return this.aiService.getReview({ code, provider });
  }

  @Post('pr-review')
  async getPRReview(@Body() { code, provider }: PostCodeReviewDTO) {
    return this.aiService.getPRReview({ code, provider });
  }

  @Post('summary')
  async getCodeSummary(@Body() { files, provider }: PostCodeSummaryDTO) {
    return this.aiService.getAISummary({ files, provider });
  }
}
