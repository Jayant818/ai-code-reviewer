import { MongooseModel } from '@app/types';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { COLLECTION_NAMES } from 'src/common/constants';
import { IUserModel, UserDocument } from 'src/user/model/user.model';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(COLLECTION_NAMES.User.user)
        private userModel: IUserModel,
    ){ }
    
    async validateUser(email: string, password: string) { 
        const user = await this.userModel.findByEmailAndPassword(email, password);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return {id:user._id}
    }
}
