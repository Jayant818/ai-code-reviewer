import { AppInjectable } from "@app/framework";
import { InjectModel } from "@nestjs/mongoose";
import { COLLECTION_NAMES } from "src/common/constants";
import { IUserModel } from "./model/user.model";
import { UserRepository } from "./user.repository";
import { MongooseTypes } from "@app/types";

@AppInjectable()
export class UserService { 
    constructor(
        private readonly userRepository: UserRepository,
    ) { }

    async updateRefreshToken({
        userId,
        hashedRefreshToken
    }: {
        userId:number,
        hashedRefreshToken:string
        }) {
        await this.userRepository.update(
            {
                _id:new MongooseTypes.ObjectId(userId)
            },
            {
                hashedRefreshToken
            }, {}
        )
    }
    

}