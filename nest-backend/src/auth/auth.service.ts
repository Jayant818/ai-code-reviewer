import { JWT_PAYLOAD, MongooseConnection, MongooseModel, MongooseTypes } from '@app/types';
import { Injectable, NotFoundException, Req, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { COLLECTION_NAMES } from 'src/common/constants';
import { CreateUserDTO } from 'src/user/DTO/create-user.dto';
import { IUserModel } from 'src/user/model/user.model';
import * as argon from "argon2";
import { UserRepository } from 'src/user/user.repository';
import { OrganizationRepository } from 'src/organization/organization.repository';
import { CookieOptions } from 'express';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(COLLECTION_NAMES.User.user)
        private readonly userModel: IUserModel,

        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly userRepository: UserRepository,
        private readonly orgRepository: OrganizationRepository,

        @InjectConnection()
        private readonly mongooseConnection: MongooseConnection,
    ) { }
    
    // ========HELPER FUNCTIONS===========
    public generateCookieOptions = ({
    domain,
    httpOnly,
    path,
    sameSite = 'lax',
    secure = true,
    expires,
    }: {
    domain?: string;
    httpOnly?: boolean;
    path?: string;
    sameSite?: CookieOptions['sameSite']; // ✅ should be optional
    secure?: CookieOptions['secure'];
    expires?: CookieOptions['expires'];
    }): CookieOptions => {
        const cookieOptions: CookieOptions = {};

        if (sameSite !== undefined) cookieOptions.sameSite = sameSite;
        if (secure !== undefined) cookieOptions.secure = secure;
        if (expires !== undefined) cookieOptions.expires = expires;
        if (httpOnly !== undefined) cookieOptions.httpOnly = httpOnly;
        if (path !== undefined) cookieOptions.path = path;
        if (domain !== undefined) cookieOptions.domain = domain.includes('localhost') ? 'localhost' : `.${domain}`;

        return cookieOptions;
    };


    
    async validateUser(email: string, password: string) { 
        const user = await this.userModel.findByEmailAndPassword(email, password);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return {id:user._id}
    }

    async login(userId: number, orgId: number) {
        const { accessToken, refreshToken } = await this.generateToken(userId, orgId);

        const hashedRefreshToken = await argon.hash(refreshToken);

        await this.userRepository.update({
            filter:{
                _id: new MongooseTypes.ObjectId(userId)
            },
            update:{
                hashedRefreshToken
            }
        })

        return {
            id: userId,
            accessToken,
            refreshToken,
        }
    }

    async generateToken(userId: number,orgId:number) {
        const payload:JWT_PAYLOAD = {sub:userId,org:orgId}
        
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

    async refreshToken(userId: number, orgId: number) {
        // whenever we are refershing the access token also change the access token this is called Token Rotation/
        const { accessToken, refreshToken } = await this.generateToken(userId, orgId);

        const hashedRefreshToken = await argon.hash(refreshToken);

        await this.userRepository.update({
            filter:{
                _id: new MongooseTypes.ObjectId(userId)
            },
            update:{
                hashedRefreshToken
            }
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
        const session = await this.mongooseConnection.startSession();
        try {
            session.startTransaction();
            let user = await this.userModel.findByGithubId(userData.githubId,session)

            if (!user) {
                user = await this.userRepository.createUser({
                    githubId: userData.githubId,
                    username: userData.username,
                    email: userData.email, 
                    avatar: userData.avatar,
                    password: userData.password,
                    authProvider: userData.authProvider,
                }, session);
            }

            await session.commitTransaction();
            return user
        } catch (error) {
            await session.abortTransaction();
            console.error('GitHub validation error:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }


    async logout(userId: number) {        
        return await this.userRepository.update({
            filter: {
            _id: new MongooseTypes.ObjectId(userId)
            },
            update: {
                hashedRefreshToken: null
            }})
    }
}
