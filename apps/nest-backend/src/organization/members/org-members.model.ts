import { MongooseDocument, MongooseTypes } from "@app/types";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { COLLECTION_NAMES } from "src/common/constants";

@Schema({
    timestamps: true,
    collection: COLLECTION_NAMES.Organization.members
    
})
export class OrganizationMembers { 
    _id: MongooseTypes.ObjectId;

    @Prop({
        type: MongooseTypes.ObjectId,
        ref: COLLECTION_NAMES.User.user,
        required:true,
    })
    user: MongooseTypes.ObjectId;

    @Prop({
        type: MongooseTypes.ObjectId,
        ref: COLLECTION_NAMES.Organization.organization,
        required:true,
    })
    org: MongooseTypes.ObjectId;
}

export const OrganizationMembersSchema = SchemaFactory.createForClass(OrganizationMembers);

export type OrganizationMembersDocument = OrganizationMembers & MongooseDocument;

