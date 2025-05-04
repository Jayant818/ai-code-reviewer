import { Type } from 'class-transformer';
import { IsArray, IsIn, IsString, ValidateNested } from 'class-validator';

export const AiProvider = ['GEMINI', 'CLAUDE'] as const;
export type IAiProvider = (typeof AiProvider)[number];

interface File {
  filename: string;
  content: string;
}

export class FileDTO {
  @IsString()
  filename: string;

  @IsString()
  content: string;
}

export class PostCodeSummaryDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileDTO)
  files: File[];

  @IsIn(AiProvider)
  provider: IAiProvider;
}
