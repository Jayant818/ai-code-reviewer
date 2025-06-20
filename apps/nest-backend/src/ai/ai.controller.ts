import { Body, Post } from '@nestjs/common';
import { AIService } from './ai.service';
import { PostCodeReviewDTO } from './DTO/post-code-review-dto';
import { IAiProvider, PostCodeSummaryDTO } from './DTO/post-code-summary.dto';
import { AppController, Public } from '@app/framework';

@AppController('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Public()
  @Post('review')
  async getCodeReview(
    @Body() { code, provider }: { code: string; provider: IAiProvider },
  ) {
    return this.aiService.getReview({ code, provider });
  }

  @Post('pr-review')
  async getPRReview(
    @Body() { code, provider, fileContent }: PostCodeReviewDTO,
  ) {
    return this.aiService.getPRReview({ code, provider, fileContent });
  }

  @Post('summary')
  async getCodeSummary(@Body() { files, provider }: PostCodeSummaryDTO) {
    return this.aiService.getAISummary({ files, provider });
  }
}
