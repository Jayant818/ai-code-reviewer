import { IsIn, IsString } from 'class-validator';

export const AiProvider = ['GEMINI', 'CLAUDE'] as const;
export type IAiProvider = (typeof AiProvider)[number];

export class postCodeReviewDTO {
  @IsString()
  code: string;

  @IsIn(AiProvider)
  provider: IAiProvider;
}
