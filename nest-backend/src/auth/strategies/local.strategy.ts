import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";
import { AppInjectable } from "@app/framework";
import { UnauthorizedException } from "@nestjs/common";

@AppInjectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        // passport-local-strategy by default expect - username & password
        super({
            usernameField: "email",
        })
    }

    validate(email: string, password: string) {
        if (password === "")
            throw new UnauthorizedException("Password cannot be empty");
        // passport create a user Object, adds all the fields in that object and attach it to the request
        return this.authService.validateUser(email, password);
    }
}