import { IsIn, IsString } from 'class-validator';
import { AiProvider, IAiProvider } from './post-code-summary.dto';

export class PostCodeReviewDTO {
  @IsString()
  code: string;

  @IsIn(AiProvider)
  provider: IAiProvider;
}
