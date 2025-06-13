import { AppInjectable } from "@app/framework";
import { MongooseConnection, MongooseTypes } from "@app/types";
import { InjectConnection } from "@nestjs/mongoose";
import { OrganizationRepository } from "../organization.repository";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { BILLING_PERIOD, PLAN } from "./org-subscription.model";
import { ClientSession } from "mongoose";
import { ORGANIZATION_SUBSCRIPTION_LOG_EVENT } from "../logs/org-subscription-logs.model";

@AppInjectable()
export class OrgSubscriptionService { 
    constructor(
        @InjectConnection()
        private readonly MongooseConnection: MongooseConnection,
        private readonly OrganizationRepository: OrganizationRepository,
    ) { }

    private async startFreeTrial({
        org,
        session,
    }: {
        org: MongooseTypes.ObjectId;
        session: ClientSession;
    }) { 
        
        try {
            
            const subscription = await this.OrganizationRepository.createSubscription({
                orgId: org,
                plan: PLAN.TRIAL,
                billingPeriod: BILLING_PERIOD.MONTHLY,
                start: new Date(),
                expiresAt: new Date(new Date().setDate(new Date().getDate() + 15)), // 15 days from now
                paymentMethod: 'free',
                session: session,
            })
    
            const subscriptionLog = this.OrganizationRepository.createSubscriptionLog({
                data: {
                    orgId: org,
                    subscriptionId: subscription._id,
                    event: ORGANIZATION_SUBSCRIPTION_LOG_EVENT.TRIAL,
                },
                session
            })

            const availedTrial = this.OrganizationRepository.createTrial({
                data: {
                    orgId: org
                },
                session
            })

            await Promise.all([
                subscriptionLog, availedTrial
            ])
        }
        catch (e) {
            throw new Error("Failed to create Free Trial");
        }

    }

    private async startPaidSubscription(org: MongooseTypes.ObjectId) { }

    
    async createSubscription({
        plan,
        user,
        org,
    }: {
        plan: string;
        user: MongooseTypes.ObjectId;
        org: MongooseTypes.ObjectId;
    }) {
        const session = await this.MongooseConnection.startSession();

        try {
            await session.startTransaction();
            const orgDoc = await this.OrganizationRepository.findOne({
                filter: { _id: org },
                session,
            })

            if (!orgDoc) {
                throw new NotFoundException("Organization Doesn't Exist");
            }

            const subscription = await this.OrganizationRepository.findSubscription({
                filter: { orgId: org },
                session,
            })

            if (subscription || subscription?.expiresAt > new Date()) {
                throw new ForbiddenException("Organization Already Has A Subscription");
            }

            switch (plan) {
                case PLAN.TRIAL:
                    const availedTrial = await this.OrganizationRepository.findTrial({
                        filter: { orgId: org },
                        session,
                    })

                    if (availedTrial) {
                        throw new ForbiddenException("Organization Already Has A Trial");
                    }
                    return this.startFreeTrial({
                        org,
                        session,
                    });
                case PLAN.PAID:
                    return this.startPaidSubscription(org);
                default:
                    throw new NotFoundException("Invalid Plan");
            }            
        } catch (e: any) {
            await session.abortTransaction();
        } finally {
            await session.endSession();
        }
    }
}