import { MongooseDocument, MongooseTypes } from "@app/types";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Mongoose } from "mongoose";
import { COLLECTION_NAMES } from "src/common/constants";

export const LLM = {
    GEMINI: 'gemini',
    CLAUDE: 'claude',
    GPT: 'gpt'
} as const;

export type ILLM = typeof LLM[keyof typeof LLM];

export const LLM_VALUES = Object.values(LLM);

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
        default:5,
    })
    seatsLeft: number;

    @Prop({
        type: LLM,
        default: LLM.GPT,
        required:true,
    })
    LLM : ILLM

}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

export type OrganizationDocument = Organization & MongooseDocument;

OrganizationSchema.index({ name: 1 }, { unique: true });
