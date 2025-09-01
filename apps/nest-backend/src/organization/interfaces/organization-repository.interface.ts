import { ClientSession, PipelineStage } from "mongoose";
import { Organization, OrganizationDocument } from "../Model/organization.model";
import { IBILLING_PERIOD, OrganizationSubscription, OrganizationSubscriptionDocument } from "../subscriptions/org-subscription.model";
import { IPLAN } from "../Model/pricing-plan.model";
import { MongooseTypes } from "@app/types";
import { orgSubscriptionLogs, orgSubscriptionLogsDocument } from "../logs/org-subscription-logs.model";
import { OrganizationTrials, OrganizationTrialsDocument } from "../trials/org-trials.model";

export interface IOrganizationRepository{
    createOrganization(data: Partial<Organization>, session?: ClientSession): Promise<OrganizationDocument>;
    updateOrganization<K extends keyof Organization>({
        filter,
        update,
        session,
    }: {
        filter: Partial<Record<K, Organization[K]>>;
        update: Record<string, any>;
        session?: ClientSession;
    }): Promise<Organization | null>;
    aggregateOrgModel(pipeline: PipelineStage[]): Promise<OrganizationDocument[]>;

    createSubscription({
            orgId,
            plan,
            billingPeriod,
            start,
            expiresAt,
            paymentMethod,
            session,
        }: {
            orgId: MongooseTypes.ObjectId;
            plan: IPLAN;
            billingPeriod: IBILLING_PERIOD;
            start: Date;
            expiresAt: Date;
            paymentMethod: string;
            session?: ClientSession;
        }): Promise<OrganizationSubscriptionDocument>;
    
    createSubscriptionLog({
        data,
        session,
    }: {
        data: Omit<orgSubscriptionLogs, "_id" | "createdAt" | "updatedAt">,
        session?: ClientSession
        }): Promise<orgSubscriptionLogsDocument>;
    
    createTrial({
            data,
            session,
        }: {
            data: Omit<OrganizationTrials, "_id" | "createdAt"| "updatedAt">,
            session?:ClientSession
        }): Promise<OrganizationTrialsDocument>;
    
    findOne<k extends keyof Organization>({
        filter,
        select,
        populate,
        session,
    }: {
        filter: Record<k, Organization[k]>;
        select?: string[],
        populate?: ({ path: string, select?: string } | string)[],
        session?: ClientSession,
        }): Promise<Organization | null>;
    
    findSubscription<k extends keyof OrganizationSubscription>({
        filter,
        select,
        populate ,
        session,
    }: {
        filter: Record<k, OrganizationSubscription[k]>;
        select?: string[],
        populate?: ({ path: string, select?: string } | string)[],
        session?: ClientSession,
    }): Promise<OrganizationSubscription | null>;

    updateSubscription<k extends keyof OrganizationSubscription>({
        filter,
        update,
        session,
    }: {
        filter: Record<k, OrganizationSubscription[k]>;
        update: Partial<OrganizationSubscription>;
        session?: ClientSession;
    }): Promise<OrganizationSubscription | null>;

    findTrial<k extends keyof OrganizationTrials>({
        filter,
        select,
        populate,
        session
    }: {
        filter: Record<k, OrganizationTrials[k]>;
        select?: string[],
        populate?: ({ path: string, select?: string } | string)[],
        session?: ClientSession,
    }):Promise<OrganizationTrials | null>;
}

export const IOrganizationRepository = Symbol("IOrganizationRepository");