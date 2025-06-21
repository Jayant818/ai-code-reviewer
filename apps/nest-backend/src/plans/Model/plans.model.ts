import { MongooseTypes } from "@app/types";
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
    collection: COLLECTION_NAMES.Plans.Plans,
    timestamps:true,
})
export class Plans{
    _id: MongooseTypes.ObjectId;

    @Prop({
        type: PLAN_VALUES,
        required:true,
    })
    name: IPLAN;

}

const PlanSchema = SchemaFactory.createForClass(Plans);

export type PlanDocument = Plans & Document;