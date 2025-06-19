import { AppInjectable } from "@app/framework";
import { JWT_PAYLOAD } from "@app/types";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "../auth.service";

/** 
 * This is the RefreshJWT strategy for the local authentication
 * This verifies is the refresh token is valid.
*/
@AppInjectable()
export class JwtStrategy extends PassportStrategy(Strategy,"refresh-jwt") {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('refresh'),
            secretOrKey: configService.get<string>('REFRESH_TOKEN_SECRET'),
            ignoreExpiration: false,
            passReqToCallback:true
        })
    }
    
    validate(req: Request, payload: JWT_PAYLOAD) {
        console.log("Called bhai");
        const refreshToken = req.body.refresh;
        const userId = payload.sub;
        const orgId = payload.org;
        const username = payload.username;
        return this.authService.validateRefreshToken(userId, refreshToken); 
    }
}