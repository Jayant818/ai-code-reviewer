import { AppController } from "@app/framework";
import { UserService } from "./user.service";
import { Get, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/gaurds/jwt-auth/jwt-auth.guard";
import { MongooseTypes } from "@app/types";

@AppController('user')
export class UserController{
    constructor(
        private readonly userService:UserService
    ) { }
    
    @Get('current')
    @UseGuards(JwtAuthGuard)
    getUser(@Req() req) { 
        return this.userService.getUser(new MongooseTypes.ObjectId(req.user.id));
    }
}