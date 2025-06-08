import { AppController } from "@app/framework";
import { UserService } from "./user.service";

@AppController('user')
export class UserController{
    constructor(
        private readonly userService:UserService
    ){}
}