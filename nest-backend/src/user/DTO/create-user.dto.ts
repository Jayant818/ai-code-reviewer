import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateUserDTO{
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsNumber()
    @IsOptional()
    githubId?: number;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsOptional()
    @IsString()
    avatar?: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}