import { AppInjectable } from "@app/framework";
import { MongooseTypes } from "@app/types";
import { IPLAN } from "src/organization/Model/pricing-plan.model";

@AppInjectable()
export class PaymentsService{
    constructor() { }
    
    async getPaymentUrl({
        id,
        orgId,
        plan_name
    }: {
        id: MongooseTypes.ObjectId;
        orgId: MongooseTypes.ObjectId;
        plan_name: IPLAN;
    }) {
        
    }
}