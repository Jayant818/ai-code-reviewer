import { IsString } from "class-validator";

export class slackCallbackQueryDTO{
    @IsString()
    code: string;
    
    @IsString()
    state: string;

    @IsString()
    userId: string;
}