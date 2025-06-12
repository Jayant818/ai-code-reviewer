import { MongooseDocument, MongooseTypes } from "@app/types";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { COLLECTION_NAMES } from "src/common/constants";

export const PLAN = {
    TRIAL: 'trial',
    PAID: 'paid',
    INACTIVE:'inactive'
} as const;

export type IPLAN = typeof PLAN[keyof typeof PLAN];

export const PLAN_VALUES = Object.values(PLAN);

@Schema({
    timestamps: true,
    collection: COLLECTION_NAMES.Organization.subscription,
})
export class OrganizationSubscription {
    _id: MongooseTypes.ObjectId;

    @Prop({
        type: MongooseTypes.ObjectId,
        ref: COLLECTION_NAMES.Organization.organization,
        required:true
    })
    orgId: MongooseTypes.ObjectId;

    @Prop({
        type: String,
        enum: PLAN,
        default: PLAN.TRIAL,
    })
    plan: IPLAN;

    @Prop({
        required: true,
        type: Date,
    })
    start: Date;

    @Prop({
        required: true,
        type: Date,
    })
    end: Date;

}

export const OrganizationSubscriptionSchema = SchemaFactory.createForClass(OrganizationSubscription);

export type OrganizationSubscriptionDocument = OrganizationSubscription & MongooseDocument;

OrganizationSubscriptionSchema.index({ orgId: 1 }, { unique: true });

