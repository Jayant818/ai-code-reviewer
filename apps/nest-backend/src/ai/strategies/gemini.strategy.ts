import { AppInjectable } from '@app/framework/src/decorators';
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

    if (!FullFileContent) {
      return response.text;
    }

    let raw = response.text;

    // Sanitize the response: Remove Markdown code blocks if any
    raw = raw.replace(/^```(?:json|javascript)?\s*/i, '').replace(/```$/, '').trim();

    // Check if this is a JSON response (for PR reviews) or a string response (for general reviews)
    try {
      const parsed = JSON.parse(raw);
      return parsed;
    } catch (error) {
      // If JSON parsing fails, return the raw string (for general reviews)
      return raw;
    }
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
      prompt: fullReviewPrompt,
    });
  }

  async getSummary({ files }: { files: File[] }): Promise<any> {
    return await this.getResponseFromAI({
      content: files,
      prompt: summaryPrompt,
    });
  }
}
