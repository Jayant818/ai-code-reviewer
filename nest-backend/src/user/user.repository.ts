import { AppInjectable } from "@app/framework";
import { Inject } from "@nestjs/common";
import { COLLECTION_NAMES } from "src/common/constants";
import { User, UserDocument } from "./model/user.model";
import { MongooseModel } from "@app/types";
import { InjectModel } from "@nestjs/mongoose";

@AppInjectable()
export class UserRepository  {
    constructor(
        @InjectModel(COLLECTION_NAMES.User.user)
        private readonly userModel: MongooseModel<UserDocument>
    ) { }
    
    async createUser(data: Partial<User>) {
        const user = await this.userModel.create(data);
    }
}