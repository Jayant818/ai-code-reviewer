import { AppInjectable } from "@app/framework";
import { MongooseDocument, MongooseModel, MongooseTypes } from "@app/types";
import { InjectModel } from "@nestjs/mongoose";
import { COLLECTION_NAMES } from "src/common/constants";
import { OrganizationTrials, OrganizationTrialsDocument } from "./trials/org-trials.model";
import { Organization, OrganizationDocument } from "./Model/organization.model";
import { ClientSession } from "mongoose";
import { IBILLING_PERIOD, IPLAN, OrganizationSubscription, OrganizationSubscriptionDocument } from "./subscriptions/org-subscription.model";
import { orgSubscriptionLogs, orgSubscriptionLogsDocument } from "./logs/org-subscription-logs.model";

@AppInjectable()
export class OrganizationRepository{
    constructor(
        @InjectModel(COLLECTION_NAMES.Organization.organization)
        private readonly organizationModel: MongooseModel<OrganizationDocument>,

        @InjectModel(COLLECTION_NAMES.Organization.subscription)
        private readonly subscriptionModel: MongooseModel<OrganizationSubscriptionDocument>,

        @InjectModel(COLLECTION_NAMES.Organization.availedTrials)
        private readonly trialsModel: MongooseModel<OrganizationTrialsDocument>,

        @InjectModel(COLLECTION_NAMES.Organization.subscriptionLogs)
        private readonly subscriptionLogsModel: MongooseModel<orgSubscriptionLogsDocument>,

    ) {}
    async createOrganization(data: Partial<Organization>,session?:ClientSession): Promise<OrganizationDocument>{
        const org = new this.organizationModel(data);
        await org.save({session});
        return org;
    }

    async createSubscription({
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
    }) {
        const subscription = new this.subscriptionModel({
            orgId,
            plan,
            billingPeriod,
            start,
            expiresAt,
            paymentMethod,
        })

        await subscription.save({ session });
        return subscription;
    }   

    async createSubscriptionLog({
        data,
        session,  
    }: {
        data: Omit<orgSubscriptionLogs, "_id" | "createdAt" | "updatedAt">,
        session?:ClientSession
    }) {
        const query = new this.subscriptionLogsModel(data);

        return query.save({ session });
    }
    
    async createTrial({
        data,
        session,
    }: {
        data: Omit<OrganizationTrials, "_id" | "createdAt"| "updatedAt">,
        session?:ClientSession
    }) {
        const query = new this.trialsModel(data);

        return query.save({ session });
    }
    
    async findOne<k extends keyof Organization>({
        filter,
        select,
        populate = [],
        session,
    }: {
        filter: Record<k, Organization[k]>;
        select?: string[],
        populate?: ({ path: string, select?: string } | string)[],
        session?: ClientSession,
        }):Promise<Organization | null > {
        const query = this.organizationModel.findOne(filter);

        if (select) {
            query.select(select.join(' '));
        }

        if (populate) {
            populate.forEach(item => (
                typeof item === 'string' ? query.populate(item) : query.populate({path:item.path, select:item.select})
            ))
        }

        if (session) {
            query.session(session);
        }

        return query.lean<Organization>().exec();
    }
    
    async findSubscription<k extends keyof OrganizationSubscription>({
        filter,
        select,
        populate = [],
        session,
    }: {
        filter: Record<k, OrganizationSubscription[k]>;
        select?: string[],
        populate?: ({ path: string, select?: string } | string)[],
        session?: ClientSession,
    }):Promise<OrganizationSubscription | null > {
        const query = this.subscriptionModel.findOne(filter);

        if (select) {
            query.select(select.join(' '));
        }

        if (populate) {
            populate.forEach(item => (
                typeof item === 'string' ? query.populate(item) : query.populate({ path: item.path, select: item.select })
            ))    
        }

        if (session) {
            query.session(session);
        }

        return query.lean<OrganizationSubscription>().exec();
    }

    async findTrial<k extends keyof OrganizationTrials>({ 
        filter,
        select,
        populate = [],
        session
    }: {
        filter: Record<k, OrganizationTrials[k]>;
        select?: string[],
        populate?: ({ path: string, select?: string } | string)[],
        session?: ClientSession,
    }) { 
        const query = this.trialsModel.findOne(filter);

         if (select) {
            query.select(select.join(' '));
        }

        if (populate) {
            populate.forEach(item => (
                typeof item === 'string' ? query.populate(item) : query.populate({ path: item.path, select: item.select })
            ))    
        }

        if (session) {
            query.session(session);
        }

        return query.lean<OrganizationTrials>().exec();
    }
}