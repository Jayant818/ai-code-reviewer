import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { GithubStrategy } from './strategies/github.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './gaurds/jwt-auth/jwt-auth.guard';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, GithubStrategy, LocalStrategy, JwtStrategy,
    {
      // APP_GUARD is a Global guard token that applies to all the routes
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    }
  ],
})
export class AuthModule {} 
