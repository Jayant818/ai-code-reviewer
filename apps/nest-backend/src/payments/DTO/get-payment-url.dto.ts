import { IsNotEmpty, IsString } from "class-validator";

export class getPaymentUrlDTO{
    @IsString()
    @IsNotEmpty()
    plan_name: string;
}