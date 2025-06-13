import { AppInjectable } from "@app/framework";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-github2";
import { AuthService } from "../auth.service";
import { AUTH_PROVIDER } from "src/user/model/user.model";

@AppInjectable()
export class GithubStrategy extends PassportStrategy(Strategy){
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            clientID: configService.get("GITHUB_CLIENT_ID"),
            clientSecret:configService.get("GITHUB_CLIENT_SECRET"),
            callbackURL:configService.get("GITHUB_CALLBACK_URL"),
            scope: ["user:email", "read:user", "repo"],
            
        })
    }

    async validate(accessToken:string,refreshToken:string,profile:any,done:Function) {

        const primaryEmail = profile.emails && profile.emails.length > 0 
                    ? profile.emails[0].value 
            : null;
        
        const user = await this.authService.validateGithubUser({
            githubId: profile.id,
            username: profile.username,
            email: primaryEmail ,
            avatar: profile.photos[0].value,
            password: null,
            authProvider: AUTH_PROVIDER.GITHUB,
        });

        done(null, user);
    }
}