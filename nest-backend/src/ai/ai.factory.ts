import { GeminiStrategy } from './strategies/gemini.strategy';
import { IAiProvider } from './DTO/post-code-summary.dto';
import { AppInjectable } from '@app/framework';

@AppInjectable()
export class AIFactory {
  constructor(private readonly geminiStrategy: GeminiStrategy) {}

  getStrategy(provider: IAiProvider) {
    if (provider === 'GEMINI') {
      return this.geminiStrategy;
    }
  }
}
