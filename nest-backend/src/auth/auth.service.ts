import { JWT_PAYLOAD, MongooseModel, MongooseTypes } from '@app/types';
import { Injectable, NotFoundException, Req, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { COLLECTION_NAMES } from 'src/common/constants';
import { CreateUserDTO } from 'src/user/DTO/create-user.dto';
import { IUserModel } from 'src/user/model/user.model';
import { UserService } from 'src/user/user.service';
import * as argon from "argon2";
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(COLLECTION_NAMES.User.user)
        private readonly userModel: IUserModel,

        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly userService: UserService,
        private readonly userRepository:UserRepository,
    ){ }
    
    async validateUser(email: string, password: string) { 
        const user = await this.userModel.findByEmailAndPassword(email, password);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return {id:user._id}
    }

    async login(userId: number) {
        const { accessToken, refreshToken } = await this.generateToken(userId);

        const hashedRefreshToken = await argon.hash(refreshToken);

        await this.userService.updateRefreshToken({
            userId,
            hashedRefreshToken
        })

        return {
            id: userId,
            accessToken,
            refreshToken,
        }
    }

    async generateToken(userId: number) {
        const payload:JWT_PAYLOAD = {sub:userId}
        
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
                expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN')
            })
        ]);

        return {
            accessToken,
            refreshToken
        }
    }

    async refreshToken(userId: number) {
        // whenever we are refershing the access token also change the access token this is called Token Rotation/
        const { accessToken, refreshToken } = await this.generateToken(userId);

        const hashedRefreshToken = await argon.hash(refreshToken);

        await this.userService.updateRefreshToken({
            userId,
            hashedRefreshToken
        })

        return {
            id: userId,
            accessToken,
            refreshToken,
        }
    }

    // This is called at the time of generation of a new access token.
    async validateRefreshToken(userId: number, refreshToken: string) { 
        // get the user from the DB 
        const user = await this.userRepository.findOne({
            filter: {
                _id: new MongooseTypes.ObjectId(userId)
            },
            select: [
                "hashedRefreshToken"
            ]
        })

        if (!user || !user.hashedRefreshToken) {
            throw new UnauthorizedException('Refresh token is invalid');
        }

        // this takes hashed token and compare it with the token we got
        const isMatched = await argon.verify(user.hashedRefreshToken, refreshToken);

        if (!isMatched)
            throw new UnauthorizedException('Refresh token is invalid');

        return {
            id: userId
        }


    }

    async validateGithubUser(userData: CreateUserDTO) {
        try {
            let user = await this.userModel.findByGithubId(userData.githubId);

            if (!user) {
                user = await this.userModel.create({
                    githubId: userData.githubId,
                    username: userData.username,
                    email: userData.email, 
                    avatar: userData.avatar,
                    password: userData.password,
                    authProvider: userData.authProvider,
                });
            }

            return user
        } catch (error) {
            console.error('GitHub validation error:', error);
            throw error;
        }
    }


    async logout(userId:number) {
        return await this.userRepository.update({
            _id: new MongooseTypes.ObjectId(userId)
        }, {
            hashedRefreshToken: null
        },{})
    }
}
