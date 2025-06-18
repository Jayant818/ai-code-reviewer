import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { COLLECTION_NAMES } from "src/common/constants";
import { UserSchema } from "./model/user.model";
import { Mongoose } from "mongoose";
import { MongooseModule } from "@nestjs/mongoose";
import { UserRepository } from "./user.repository";

const USER_MODULES = [
    {
        name: COLLECTION_NAMES.User.user,
        schema:UserSchema,
    }
]

@Module({
    imports: [
        MongooseModule.forFeature(USER_MODULES)
    ],
    controllers: [UserController],
    providers: [UserService,UserRepository],
    exports: [MongooseModule,UserService,UserRepository]
})
export class UserModule{}