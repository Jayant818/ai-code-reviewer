import { MongooseTypes } from "@app/types";
import { Prop, Schema } from "@nestjs/mongoose";
import { Mongoose } from "mongoose";
import { COLLECTION_NAMES } from "src/common/constants";

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

}
