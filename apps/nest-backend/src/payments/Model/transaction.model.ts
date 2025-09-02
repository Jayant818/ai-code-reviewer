import { MongooseTypes } from "@app/types";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { COLLECTION_NAMES } from "src/common/constants";
import { IPaymentProviders, PAYMENT_PROVIDERS_VALUES } from "./order.model";

export const TRANSACTION_STATUS = {
    CREATED: 'created',
    PAID: 'paid',
    FAILED:'failed'
}

export type ITransactionStatus = typeof TRANSACTION_STATUS[keyof typeof TRANSACTION_STATUS];

export const TRANSACTION_STATUS_VALUES = Object.values(TRANSACTION_STATUS);

export const TRANSACTION_TYPES = {
    PAYMENT: 'payment',
    REFUND: 'refund',
    Subscription: 'subscription', // For recurring payments
}

export type ITransactionTypes = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES];

export const TRANSACTION_TYPES_VALUES = Object.values(TRANSACTION_TYPES);

@Schema({
    timestamps: true,
    collection:COLLECTION_NAMES.Payments.transaction
})
export class Transaction{

    _id: MongooseTypes.ObjectId;

    @Prop({
        required: true,
        ref: COLLECTION_NAMES.Payments.order,
        type: MongooseTypes.ObjectId,
    })
    order: MongooseTypes.ObjectId;

    @Prop({
        required: true,
        type: String,
        enum: TRANSACTION_STATUS_VALUES,
        default: TRANSACTION_STATUS.CREATED,
    })
    status: ITransactionStatus;

    @Prop({
        required: false,
        type: String,
        nullable: true,
    })
    providerTransactionId: string;

    // Idempotency fields
    @Prop({
        required: false,
        type: String,
        nullable: true,
    })
    webhookEventId: string; // Razorpay event ID for idempotency

    @Prop({
        required: false,
        type: Date,
        nullable: true,
    })
    webhookProcessedAt: Date; // When webhook was processed

    @Prop({
        required: false,
        type: Number,
        nullable: true,
    })
    webhookAttemptCount: number; // Track webhook processing attempts

    // Important for fraud detection
    // Keeping this at transaction level because it can be different for different transactions.
    // The link user got can be shared with team memebers/finance head.
    @Prop({
        required: false,
        type: String,
        nullable: true,
    })
    clientIp: string;

    @Prop({
        required: true,
        type: String,
        enum: PAYMENT_PROVIDERS_VALUES,
    })
    paymentProvider: IPaymentProviders;

    // If we are accepting international payments, we need to keep track of the conversion rate.
    @Prop({ 
        required: false,
        type: Number,
    })
    conversionRate: number;

    // can used for analytics & for handling tax.
    @Prop({
        required: true,
        type: String,
    })
    country: string;

    /*
    Keeping all the details return by the payment provider.
    There can be many real-world cases where we need to refer to this data.
    For example, if user did partial payment or use some provider based coupon.
    */
    @Prop({
        required: false,
        type:Number,
    })
    amount: number;

    @Prop({
        required: false,
        type: String,
    })
    currency: string;

    @Prop({
        type: Object,
        required: false,
    })
    metaData: Record<string, any>;

    @Prop({
        type: String,
        enum: TRANSACTION_TYPES_VALUES,
        required: true,
        default: TRANSACTION_TYPES.PAYMENT,
    })
    type: ITransactionTypes;

    createdAt: Date;
    
    updatedAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Add index for idempotency
TransactionSchema.index({ webhookEventId: 1 }, { unique: true, sparse: true });

export type TransactionDocument = Transaction & Document;