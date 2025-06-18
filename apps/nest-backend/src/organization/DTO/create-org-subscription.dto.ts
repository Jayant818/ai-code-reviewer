import { IsIn, IsEnum } from "class-validator";

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
    @IsIn(['trial', 'paid', 'inactive'])
    plan: string;
}