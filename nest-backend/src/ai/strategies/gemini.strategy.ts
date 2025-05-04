import { AppInjectable } from 'lib/framework/src/decorators';
import AIStrategy from '../strategy.interface';
import {
  fullReviewPrompt,
  githubReviewPrompt,
  summaryPrompt,
} from '../constants';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

interface File {
  filename: string;
  content: string;
}

@AppInjectable()
export class GeminiStrategy implements AIStrategy {
  constructor(private readonly configService: ConfigService) {}

  async getResponseFromAI({
    content,
    prompt,
  }: {
    content: any;
    prompt: string;
  }): Promise<any> {
    const genAI = new GoogleGenAI({
      apiKey: this.configService.get('GEMINI_API_KEY'),
    });
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: content,
      config: {
        systemInstruction: prompt,
      },
    });
    return response.text;
  }

  async getPRReview({ code }: { code: string }): Promise<any> {
    return await this.getResponseFromAI({
      content: code,
      prompt: githubReviewPrompt,
    });
  }

  async getReview({ code }: { code: string }): Promise<any> {
    return await this.getResponseFromAI({
      content: code,
      prompt: githubReviewPrompt,
    });
  }

  async getSummary({ files }: { files: File[] }): Promise<any> {
    return await this.getResponseFromAI({
      content: files,
      prompt: summaryPrompt,
    });
  }
}
