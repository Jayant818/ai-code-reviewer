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

export const BILLING_PERIOD = {
    YEARLY: 'yearly',
    MONTHLY:'monthly'
} as const;

export type IBILLING_PERIOD = typeof BILLING_PERIOD[keyof typeof BILLING_PERIOD];

export const BILLING_PERIOD_VALUES = Object.values(BILLING_PERIOD);


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
        enum: PLAN_VALUES,
        default: PLAN.TRIAL,
    })
    plan: IPLAN;

    @Prop({
        type: String,
        enum: BILLING_PERIOD_VALUES,
        required:true,
    })
    billingPeriod: IBILLING_PERIOD;

    @Prop({
        required: true,
        type: Date,
    })
    start: Date;

    @Prop({
        required: true,
        type: Date,
    })
    expiresAt: Date;

    @Prop({
        type: String,
        required:true
    })
    paymentMethod: string;

    createdAt: Date;

    updatedAt: Date;

}

export const OrganizationSubscriptionSchema = SchemaFactory.createForClass(OrganizationSubscription);

export type OrganizationSubscriptionDocument = OrganizationSubscription & MongooseDocument;

OrganizationSubscriptionSchema.index({ orgId: 1 }, { unique: true });

