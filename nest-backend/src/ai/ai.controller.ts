import { Body, Post } from '@nestjs/common';
import { AppController } from 'lib/framework/src/decorators';
import { postCodeReviewDTO } from './DTO/post-code-review-dto';
import { AIService } from './ai.service';

@AppController('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('review')
  async getCodeReview(@Body() { code, provider }: postCodeReviewDTO) {
    return this.aiService.getAIReview({ code, provider });
  }

  @Post('test')
  async test(@Body() { code, provider }: postCodeReviewDTO) {
    console.log('hellow');
    return 'hello';
  }
}
