import { AppInjectable } from "@app/framework";
import { Inject, NotFoundException } from "@nestjs/common";
import { COLLECTION_NAMES } from "src/common/constants";
import { User, UserDocument } from "./model/user.model";
import { MongooseModel } from "@app/types";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, QueryOptions } from "mongoose";

@AppInjectable()
export class UserRepository  {
    constructor(
        @InjectModel(COLLECTION_NAMES.User.user)
        private readonly userModel: MongooseModel<UserDocument>
    ) { }
    
    async createUser(data: Partial<User>,session?:ClientSession): Promise<UserDocument> {
        const user = new this.userModel(data);
        await user.save({ session });
        return user;
    }

    async findOne<K extends keyof User>(
        { 
            filter,
            select,
            populate = [],
            session,
        }:
        {   filter: Record<K, User[K]>,
            select?: string[],
            populate?: string[] | ({
                select: string,
                path: string,
            })[],
            session?:ClientSession,
        }) {
        
        // create the query 
        const query = this.userModel.findOne(filter);

        if (select) {
            query.select(select.join(' '));
        }

        if (populate.length) {
            populate.forEach((item)=>typeof item === 'string'? query.populate(item):query.populate({path:item.path,select:item.select}))
        }

        if (session) {
            query.session(session);
        }

        return query.lean<User>().exec();
    }

    async update(
        filter:Partial<User>,
        update:Partial<User>,
        options:QueryOptions,
    ) {
        const user = await this.userModel.findOneAndUpdate(filter, update, options).exec();

        if (!user) {
            throw new NotFoundException("User Doesn't Exist");
        }

        return user;
    }
}