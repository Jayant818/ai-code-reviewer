import { MongooseTypes } from "@app/types";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes } from "mongoose";
import { COLLECTION_NAMES } from "src/common/constants";

export const ORDER_STATUS = {
    CREATED: "created",
    PAID: "paid",
    FAILED: "failed",
    REFUNDED: "refunded",
}

export type IOrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS);

export const PAYMENT_PROVIDERS = {
    RAZORPAY: "razorpay",
    STRIPE: "stripe",
};

export type IPaymentProviders = typeof PAYMENT_PROVIDERS[keyof typeof PAYMENT_PROVIDERS];

export const PAYMENT_PROVIDERS_VALUES = Object.values(PAYMENT_PROVIDERS);

@Schema({
    timestamps: true,
    collection:COLLECTION_NAMES.Payments.order
})
export class Order{
    _id: MongooseTypes.ObjectId;

    @Prop({
        type: String,
        required:true,
    })
    orderId: string;

    @Prop({
        type: MongooseTypes.ObjectId,
        required:true,
    })
    orgId: MongooseTypes.ObjectId;

    @Prop({
        type: String,
        enum: ORDER_STATUS_VALUES,
        required: true,
        default: ORDER_STATUS.CREATED,
    })
    status: IOrderStatus;

    // The plans can update overtime, so we need to keep track ki user nai kitne pay kare the
    @Prop({
        type: Number,
        required: true,
    })
    amount: number;

    @Prop({
        type: String,
        required: true,
    })
    // TODO: Make this enum
    currency: string;

    @Prop({
        type: SchemaTypes.Mixed,
        required:false,
    })
    metaData: any
    
    @Prop({
        type: MongooseTypes.ObjectId,
        ref: COLLECTION_NAMES.Plans.Plans,
        required:true,
    })
    plan: MongooseTypes.ObjectId;

    @Prop({
        type: String,
        enum: PAYMENT_PROVIDERS_VALUES,
        required: true,
    })
    paymentProvider: IPaymentProviders;

    // Linked to the successful transaction ID
    @Prop({
        type: MongooseTypes.ObjectId,
        ref: COLLECTION_NAMES.Payments.transaction,
        required: false, 
    })
    successfulTransactionId: MongooseTypes.ObjectId;

    createdAt: Date;

    updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

export type OrderDocument = Order & Document;

OrderSchema.index({ orderId: 1 });
