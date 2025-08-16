import { MongooseDocument, MongooseTypes } from "@app/types";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { COLLECTION_NAMES } from "src/common/constants";

export const Integration_Types = {
    GITHUB_APP: "github",
    SLACK:'slack'
}

export type IIntegrationTypes = typeof Integration_Types[keyof typeof Integration_Types];

export const Integration_Types_Values = Object.values(Integration_Types);

@Schema({
    timestamps: true,
    collection:COLLECTION_NAMES.Integrations.Integration
})
export class Integration{
    @Prop({
        required: true,
        type: Number,
        unique: true, // This adds an Index
    })
    installationId: number;

    @Prop({
        required: true,
        type: MongooseTypes.ObjectId,
        ref: COLLECTION_NAMES.Organization.organization,
    })
    orgId: MongooseTypes.ObjectId;

    @Prop({
        required: true,
        enum: Integration_Types_Values,
        type:String,
    })
    integrationTypes: IIntegrationTypes;

    @Prop({
        type:Number,
    })
    integratedBy: number;

}

export const INTEGRATION_MODEL = Integration.name;

export const IntegrationSchema = SchemaFactory.createForClass(Integration);

export type IntegrationDocument = Integration & MongooseDocument;

