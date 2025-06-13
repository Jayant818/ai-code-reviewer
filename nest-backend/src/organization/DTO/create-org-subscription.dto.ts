import { IsIn } from "class-validator";
import { IPLAN, PLAN_VALUES } from "../subscriptions/org-subscription.model";

export class createOrganizationDTO{
    @IsIn(PLAN_VALUES)
    plan: IPLAN;
}