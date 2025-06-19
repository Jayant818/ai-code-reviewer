import { IsNotEmpty, IsString } from "class-validator";

export class getIntegrationDTO {
    @IsString()
    @IsNotEmpty()
    orgId: string;
}