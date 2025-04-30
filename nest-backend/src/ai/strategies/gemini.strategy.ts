import { AppInjectable } from 'lib/framework/src/decorators';
import AIStrategy from '../strategy.interface';
import { prompt } from '../constants';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

@AppInjectable()
export class GeminiStrategy implements AIStrategy {
  constructor(private readonly configService: ConfigService) {}
  async getReview({ code }: { code: string }): Promise<any> {
    const genAI = new GoogleGenAI({
      apiKey: this.configService.get('GEMINI_API_KEY'),
    });
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: code,
      config: {
        systemInstruction: prompt,
      },
    });
    return response.text;
  }
}
