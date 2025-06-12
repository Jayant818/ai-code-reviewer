import { MongooseDocument, MongooseTypes } from "@app/types";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { COLLECTION_NAMES } from "src/common/constants";

@Schema({
    timestamps: true,
    collection: COLLECTION_NAMES.Organization.availedTrials,
})
export class OrganizationTrials {
    _id: MongooseTypes.ObjectId;

    @Prop({
        type: MongooseTypes.ObjectId,
        ref: COLLECTION_NAMES.User.user,
        required:true,
    })
    user: MongooseTypes.ObjectId;
}

export const OrganizationTrialsSchema = SchemaFactory.createForClass(OrganizationTrials);

export type OrganizationTrialsDocument = OrganizationTrials & MongooseDocument;