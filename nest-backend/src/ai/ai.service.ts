import { AppInjectable } from 'lib/framework/src/decorators';
import { AIFactory } from './ai.factory';
import { postCodeReviewDTO } from './DTO/post-code-review-dto';

@AppInjectable()
export class AIService {
  constructor(private readonly AIFactory: AIFactory) {}

  async getAIReview({ code, provider }: postCodeReviewDTO) {
    const strategy = this.AIFactory.getStrategy(provider);

    const data = await strategy.getReview({ code });

    return { review: data };
  }
}
