import { AppInjectable } from 'lib/framework/src/decorators';
import { GeminiStrategy } from './strategies/gemini.strategy';
import { IAiProvider } from './DTO/post-code-review-dto';

@AppInjectable()
export class AIFactory {
  constructor(private readonly geminiStrategy: GeminiStrategy) {}

  getStrategy(provider: IAiProvider) {
    if (provider === 'GEMINI') {
      return this.geminiStrategy;
    }
  }
}
