import { MongooseDocument, MongooseTypes } from "@app/types";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { COLLECTION_NAMES } from "src/common/constants";
import { ACCOUNT_TYPES, IACCOUNT_TYPES, IPERMISSION_TYPE } from "src/common/enums";

const IntegrationTypes = ["Github_APP"] as const;

type IIntegrationTypes = typeof IntegrationTypes[number];

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
        enum: IntegrationTypes,
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

