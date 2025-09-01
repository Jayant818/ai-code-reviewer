import { MongooseTypes } from "@app/types";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { COLLECTION_NAMES } from "src/common/constants";

export const PLAN = {
    TRIAL: 'trial',
    PRO: 'pro',
    INACTIVE:'inactive'
} as const;

export type IPLAN = typeof PLAN[keyof typeof PLAN];

export const PLAN_VALUES = Object.values(PLAN);

export const PLAN_PERIOD = {
    MONTHLY: 'monthly',
    YEARLY: 'yearly'
}

export interface IPrice {
    amount: number;
    currency: string;
  }

export type IPLAN_PERIOD = typeof PLAN_PERIOD[keyof typeof PLAN_PERIOD]

export const PLAN_PERIOD_VALUES = Object.values(PLAN_PERIOD);

export const MODELS = {
    CLAUDE_3_SONNET: 'claude-3-sonnet',
    GEMINI_25_FLASH: 'gemini-2.5-flash',
    GPT_4:'gpt-4'
}

export type IMODELSTYPE = typeof MODELS[keyof typeof MODELS];

export const MODELS_VALUES = Object.values(MODELS);

@Schema({
    collection: COLLECTION_NAMES.Plans.Plans,
    timestamps:true,
})
export class Plans{
    _id: MongooseTypes.ObjectId;

    @Prop({
        type: String,
        enum: PLAN_VALUES,
        required: true,
    })
    name: IPLAN;

    @Prop({
        type: {
            amount: Number,
            currency: String,
        },
        required:true,
    })
    price: IPrice;

    @Prop({
        type: Number,
        required:true
    })
    reviewsGranted: number;

    @Prop({
        type: String,
        enum: PLAN_PERIOD_VALUES,
        required: true,
    })
    period: IPLAN_PERIOD;

    @Prop({
        type: [
            {
                model: {
                    type: String,
                    enum: MODELS_VALUES,
                    required: true
                },
                quota:Number,
            }
        ],
        default:[]
    })
    modelsAllowed: {
        model: IMODELSTYPE;
        quota: number;
    }[];
}

export const PlanSchema = SchemaFactory.createForClass(Plans);

export type PlanDocument = Plans & Document;