import { AppInjectable } from '@app/framework/src/decorators';
import AIStrategy from '../strategy.interface';
import {
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
    FullFileContent,
  }: {
    content: any;
    prompt: string;
    FullFileContent?: string;
  }): Promise<any> {
    if (FullFileContent) {
      prompt += `\n\nHere is the Full File Content, Now review only the change that I have made, this file is for context only :\n${FullFileContent}`;
    }

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

  async getPRReview({
    code,
    fileContent,
  }: {
    code: string;
    fileContent: string;
  }): Promise<any> {
    return await this.getResponseFromAI({
      FullFileContent: fileContent,
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
