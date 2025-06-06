import { AppInjectable } from '@app/framework';
import { AIFactory } from './ai.factory';
import { PostCodeReviewDTO } from './DTO/post-code-review-dto';
import { IAiProvider, PostCodeSummaryDTO } from './DTO/post-code-summary.dto';

@AppInjectable()
export class AIService {
  constructor(private readonly AIFactory: AIFactory) {}

  async getReview({ code, provider }: { code: string; provider: IAiProvider }) {
    const strategy = this.AIFactory.getStrategy(provider);

    const data = await strategy.getReview({ code });

    return { review: data };
  }

  async getPRReview({ code, provider, fileContent }: PostCodeReviewDTO) {
    const strategy = this.AIFactory.getStrategy(provider);

    const data = await strategy.getPRReview({ code, fileContent });

    return { review: data };
  }

  async getAISummary({ files, provider }: PostCodeSummaryDTO) {
    const strategy = this.AIFactory.getStrategy(provider);

    const data = await strategy.getSummary({ files });

    return { summary: data };
  }
}
