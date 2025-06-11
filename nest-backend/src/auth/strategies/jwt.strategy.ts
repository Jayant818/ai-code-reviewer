import { AppInjectable } from "@app/framework";
import { JWT_PAYLOAD } from "@app/types";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

/** 
 * This is the JWT strategy for the local authentication
 * This validates the token for on and passes the payload to the validate method
 * Validate Method attaches the user to the request object
*/
@AppInjectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService
        ,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get<string>('JWT_SECRET'),
            // If the access token expires we can't able to make any request now.
            ignoreExpiration: false,
        })
    }
    
    validate(payload: JWT_PAYLOAD) {
        return {id: payload.sub};
    }
}