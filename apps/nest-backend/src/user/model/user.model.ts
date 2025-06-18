import { MongooseDocument, MongooseModel, MongooseTypes } from "@app/types";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ClientSession } from "mongoose";
import { COLLECTION_NAMES } from "src/common/constants";
import * as bcrypt from "bcrypt"

export const AUTH_PROVIDER = {
  'GITHUB' : 'github',
  'LOCAL' : 'local'
} as const;

export type IAUTH_PROVIDER = typeof AUTH_PROVIDER[keyof typeof AUTH_PROVIDER];

export const AUTH_PROVIDER_VALUES = Object.values(AUTH_PROVIDER);

@Schema({
  timestamps: true,
  collection: COLLECTION_NAMES.User.user,
})
export class User {
  _id: MongooseTypes.ObjectId;

  @Prop({
    required: true,
    type: String,
    unique: true, // This adds a index
  })
  username: string;

  @Prop({
    required: true,
    type: String,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({
    required: false,
    // Now we have explicitly select the password
    select: false,
    sparse: true,
  })
  password: string;


  @Prop({
    default: null,
    type: String,
  })
  hashedRefreshToken: string;

  @Prop({
    type: Number,
    unique: true,
    sparse: true, // Allows null values while maintaining uniqueness
  })
  githubId: number;

  @Prop({
    type: Boolean,
    default: false
  })
  verifiedEmail: boolean;

  @Prop({
    type: String,
    trim: true,
  })
  avatar: string;

  @Prop({
    type: MongooseTypes.ObjectId,
    ref: COLLECTION_NAMES.Organization.organization,
    default:null,
  })
  orgId: MongooseTypes.ObjectId;

  @Prop({ default: null })
  stripeCustomerId: string;

  @Prop({
    required: true,
    enum:AUTH_PROVIDER_VALUES,
  })
  authProvider: IAUTH_PROVIDER;

  verifyPassword: (candidatePassword: string) => Promise<boolean>;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = User & MongooseDocument;

export interface IUserModel extends MongooseModel<UserDocument>{
  findByEmailAndPassword: (email: string, password: string) => Promise<UserDocument | null>
  findByGithubId: (profileId: number,session?:ClientSession) => Promise<UserDocument | null>  
} 

// will work on save command
UserSchema.pre("save", async function (next) {
    if (!this.isModified('password') || !this.password) {
    return next();
  }
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

UserSchema.static("findByGithubId", async function(profileId:number,session?:ClientSession){
  const user = await this.findOne<UserDocument>({
    githubId:profileId
  }).session(session ?? null)

  return user;
})
