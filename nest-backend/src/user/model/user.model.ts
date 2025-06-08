import { MongooseDocument, MongooseModel } from "@app/types";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Collection } from "mongoose";
import { COLLECTION_NAMES } from "src/common/constants";
import { IPERMISSION_TYPE, PERMISSION_TYPES } from "src/common/enums";
import * as bcrypt from "bcrypt"

class Permission {
  @Prop({
      type: String,
      enum:PERMISSION_TYPES,
  })
  checks: IPERMISSION_TYPE;

  @Prop({
    type: String,
    enum:PERMISSION_TYPES,
  })
  contents: IPERMISSION_TYPE;

  @Prop({
    type: String,
    enum:PERMISSION_TYPES,
  })
  metadata: IPERMISSION_TYPE;

  @Prop({
    type: String,
    enum:PERMISSION_TYPES,
  })
  pull_requests: IPERMISSION_TYPE;
}

const PermissionSchema = SchemaFactory.createForClass(Permission);

class Repository {
  @Prop({
    type: Number,
    required:true,
  })
  id: number;

  @Prop({
    type: String,
    required:true,
  })
  node_id: string;

  @Prop({
    type: String,
    required:true,
  })
  name: string;

  @Prop({
    type: String,
    required:true,
  })
  full_name: string;

  @Prop({
    type: Boolean,
    required:true
  })
  private: boolean;
}

const RepositorySchema = SchemaFactory.createForClass(Repository);


@Schema({
  timestamps: true,
  collection: COLLECTION_NAMES.User.user,
})
export class User{
  @Prop({
      required: true,
      type: String,
      unique:true
  })
  username: string;

  @Prop({
    required: true,
    type: String,
    lowercase: true,
    trim:true,
  })
  email: string;

  @Prop({
    required: true,
    // Now we have explicitly select the password
    select:false,
  })
  password: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  verifiedEmail: boolean;

  @Prop({
    type: String,
    trim:true,
  })
  avatar: string;

  @Prop({ default: null })
  stripeAccountId: string;

  @Prop({ default: null })
  stripeCustomerId: string;

  @Prop({
    type: PermissionSchema,
    default: {
      checks: null,
      contents: null,
      metadata: null,
      pull_requests: null,
    }
  })
  permissions: Permission;

  @Prop({
    default: [],
    type:RepositorySchema
  })
  repoAccess: Repository[];

  verifyPassword: (candidatePassword: string) => Promise<boolean>;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = User & MongooseDocument;

export interface IUserModel extends MongooseModel<UserDocument>{
  findByEmailAndPassword:(email:string,password:string)=>Promise<UserDocument|null>
} 

// will work on save command
UserSchema.pre("save", async function(next)  {
  const hashedPassword = await bcrypt.hash(this.password, 10);
  this.password = hashedPassword;
  next();
})

// will work on a Document
UserSchema.method("verifyPassword", async function (candidatePassword:string) {
  const hashedPassword = this.password;
  const isMatched = await bcrypt.compare(hashedPassword, candidatePassword);
  return isMatched;
})

// Attached to the Model Itself
UserSchema.static("findByEmailAndPassword",async function (email: string, password: string) { 
  const user = await this.findOne<UserDocument>({ email }, "+password");

  if (!user) {
    return;
  }

  const isMatched = await user.verifyPassword(password);

  if (!isMatched) { 
    return;
  }

  return user;


})


UserSchema.index({ username: 1 }, { unique: true });