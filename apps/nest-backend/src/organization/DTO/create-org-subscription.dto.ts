import { IsIn, IsEnum } from "class-validator";
import { IPLAN, PLAN_VALUES } from "../Model/pricing-plan.model";

export enum SubscriptionType {
    FREE = 'free',
    PRO = 'pro'
}

export class CreateSubscriptionDto {
    @IsEnum(SubscriptionType)
    type: SubscriptionType;
}

// Keep the old DTO for backward compatibility
export class createOrganizationDTO {
    @IsIn(PLAN_VALUES)
    type: IPLAN;
}