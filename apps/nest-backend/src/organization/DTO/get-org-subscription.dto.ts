import { MongooseTypes } from "@app/types";
import { Transform } from "class-transformer";

export class GetOrgSubscriptionDTO{
    @Transform(({ value }) => new MongooseTypes.ObjectId(value))
    orgId: MongooseTypes.ObjectId;
}