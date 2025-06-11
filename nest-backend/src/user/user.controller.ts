import { AppController } from "@app/framework";
import { UserService } from "./user.service";
import { Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/gaurds/jwt-auth/jwt-auth.guard";

@AppController('user')
export class UserController{
    constructor(
        private readonly userService:UserService
    ) { }
    
    @UseGuards(JwtAuthGuard)
    getUser(@Req() req) {
        // return this.userService.getUser();   
        // req.user.id  - user id we don't sent this in params 
    }
}