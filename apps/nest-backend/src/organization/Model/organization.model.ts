import { MongooseDocument, MongooseTypes } from "@app/types";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { COLLECTION_NAMES } from "src/common/constants";
import {  IPERMISSION_TYPE, PERMISSION_TYPES } from "src/common/enums";

export const LLM = {
    GEMINI: 'gemini',
    CLAUDE: 'claude',
    GPT: 'gpt'
} as const;

export type ILLM = typeof LLM[keyof typeof LLM];

export const LLM_VALUES = Object.values(LLM);

@Schema({
    id:false,
})
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

@Schema({
    _id:false,
})
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
    collection: COLLECTION_NAMES.Organization.organization,
    timestamps:true
})
export class Organization {
    _id: MongooseTypes.ObjectId;

    @Prop({
        type: String,
        required:true,
    })
    name: string;

    @Prop({
        type: Number,
        required: true,
    })
    githubId:  Number;

    @Prop({
        type: Number,
        required: true,
        default:5,
    })
    seatsLeft: number;

    @Prop({
        type: String,
        default: LLM.GEMINI,
        enum: LLM_VALUES,
    })
    Model: ILLM;


    @Prop({
        default: [],
    })
    repoAccess: Repository[];

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
      type: Number,
      required: true,
    })
    reviewsLeft: number;

}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

export type OrganizationDocument = Organization & MongooseDocument;

OrganizationSchema.index({ name: 1 }, { unique: true });
