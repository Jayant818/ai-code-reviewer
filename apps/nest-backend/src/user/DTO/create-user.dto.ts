import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { AUTH_PROVIDER_VALUES, IAUTH_PROVIDER } from "../model/user.model";

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

    @IsIn(AUTH_PROVIDER_VALUES)
    authProvider: IAUTH_PROVIDER;
}