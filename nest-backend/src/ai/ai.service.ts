import { AppInjectable } from 'lib/framework/src/decorators';
import { AIFactory } from './ai.factory';
import { PostCodeReviewDTO } from './DTO/post-code-review-dto';
import { PostCodeSummaryDTO } from './DTO/post-code-summary.dto';

@AppInjectable()
export class AIService {
  constructor(private readonly AIFactory: AIFactory) {}

  async getReview({ code, provider }: PostCodeReviewDTO) {
    const strategy = this.AIFactory.getStrategy(provider);

    const data = await strategy.getReview({ code });

    return { review: data };
  }

  async getPRReview({ code, provider }: PostCodeReviewDTO) {
    const strategy = this.AIFactory.getStrategy(provider);

    const data = await strategy.getPRReview({ code });

    return { review: data };
  }

  async getAISummary({ files, provider }: PostCodeSummaryDTO) {
    const strategy = this.AIFactory.getStrategy(provider);

    const data = await strategy.getSummary({ files });

    return { summary: data };
  }
}
