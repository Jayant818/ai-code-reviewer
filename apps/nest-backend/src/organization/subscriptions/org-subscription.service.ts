import { AppInjectable } from "@app/framework";
import { MongooseConnection, MongooseTypes } from "@app/types";
import { InjectConnection } from "@nestjs/mongoose";
import { OrganizationRepository } from "../organization.repository";
import { ForbiddenException, NotFoundException, BadRequestException } from "@nestjs/common";
import { BILLING_PERIOD, PLAN } from "./org-subscription.model";
import { ClientSession } from "mongoose";
import { ORGANIZATION_SUBSCRIPTION_LOG_EVENT } from "../logs/org-subscription-logs.model";
import { SubscriptionType } from "../DTO/create-org-subscription.dto";
import { UserRepository } from "src/user/user.repository";

@AppInjectable()
export class OrgSubscriptionService { 
    constructor(
        @InjectConnection()
        private readonly MongooseConnection: MongooseConnection,
        private readonly OrganizationRepository: OrganizationRepository,
        private readonly UserRepository: UserRepository,
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
                session,
            })

    
            const subscriptionLog =  this.OrganizationRepository.createSubscriptionLog({
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
            ]);

        }
        catch (e) {
            throw new Error("Failed to create Free Trial",);
        }

    }

    private async startPaidSubscription(org: MongooseTypes.ObjectId) { }

    // New method to handle frontend subscription requests
    async handleSubscription({
        type,
        userId,
        orgId,
    }: {
        type: SubscriptionType;
        userId: MongooseTypes.ObjectId;
        orgId: MongooseTypes.ObjectId;
    }) {
        try {
            // Map frontend types to backend plans
            const plan = type === SubscriptionType.FREE ? PLAN.TRIAL : PLAN.PAID;

            // Check existing subscription
            const existingSubscription = await this.OrganizationRepository.findSubscription({
                filter: { orgId },
            });

            if (existingSubscription) {
                // Update existing subscription
                return this.updateSubscription(orgId, type);
            }

            // Create new subscription
            return this.createNewSubscription(orgId, type);
        } catch (error) {
            throw new BadRequestException(`Failed to handle subscription: ${error.message}`);
        }
    }

    async getCurrentSubscription(orgId: MongooseTypes.ObjectId) {
        try {
            const subscription = await this.OrganizationRepository.findSubscription({
                filter: { orgId },
            });

            if (!subscription) {
                return {
                    success: true,
                    data: {
                        subscriptionId: null,
                        type: 'free',
                        status: 'inactive',
                        startDate: new Date().toISOString(),
                    }
                };
            }

            return {
                success: true,
                data: {
                    subscriptionId: subscription._id.toString(),
                    type: subscription.plan === PLAN.TRIAL ? 'free' : 'pro',
                    status: new Date() < subscription.expiresAt ? 'active' : 'expired',
                    startDate: subscription.start.toISOString(),
                    endDate: subscription.expiresAt.toISOString(),
                }
            };
        } catch (error) {
            throw new BadRequestException(`Failed to get subscription: ${error.message}`);
        }
    }

    async cancelSubscription(orgId: MongooseTypes.ObjectId) {
        const session = await this.MongooseConnection.startSession();

        try {
            await session.withTransaction(async () => {
                const subscription = await this.OrganizationRepository.findSubscription({
                    filter: { orgId },
                    session,
                });

                if (!subscription) {
                    throw new NotFoundException("No active subscription found");
                }

                // Update subscription to inactive
                await this.OrganizationRepository.updateSubscription({
                    filter: { orgId },
                    update: {
                        plan: PLAN.INACTIVE,
                        expiresAt: new Date() // Expire immediately
                    },
                    session,
                });

                // Log the cancellation
                await this.OrganizationRepository.createSubscriptionLog({
                    data: {
                        orgId,
                        subscriptionId: subscription._id,
                        event: ORGANIZATION_SUBSCRIPTION_LOG_EVENT.CANCELLED,
                    },
                    session
                });
            });

            return {
                success: true,
                data: {
                    subscriptionId: null,
                    type: 'free',
                    status: 'cancelled',
                    endDate: new Date().toISOString()
                }
            };
        } catch (error) {
            await session.abortTransaction();
            throw new BadRequestException(`Failed to cancel subscription: ${error.message}`);
        } finally {
            await session.endSession();
        }
    }

    private async createNewSubscription(orgId: MongooseTypes.ObjectId, type: SubscriptionType) {
        const session = await this.MongooseConnection.startSession();

        try {
            let result;
            await session.withTransaction(async () => {
                if (type === SubscriptionType.FREE) {
                    // Check if trial already used
                    const availedTrial = await this.OrganizationRepository.findTrial({
                        filter: { orgId },
                        session,
                    });

                    if (availedTrial) {
                        throw new ForbiddenException("Organization already used free trial");
                    }

                    await this.startFreeTrial({ org: orgId, session });
                    result = {
                        success: true,
                        data: {
                            subscriptionId: 'trial_' + orgId.toString(),
                            type: 'free',
                            status: 'active',
                            startDate: new Date().toISOString(),
                            endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                        }
                    };
                } else {
                    // Handle Pro subscription
                    await this.startPaidSubscription(orgId);
                    result = {
                        success: true,
                        data: {
                            subscriptionId: 'pro_' + orgId.toString(),
                            type: 'pro',
                            status: 'active',
                            startDate: new Date().toISOString(),
                            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                            paymentUrl: 'https://stripe.com/payment-link'
                        }
                    };
                }
            });

            return result;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    private async updateSubscription(orgId: MongooseTypes.ObjectId, type: SubscriptionType) {
        // Handle subscription updates/upgrades
        return {
            success: true,
            data: {
                subscriptionId: 'updated_' + orgId.toString(),
                type: type,
                status: 'active',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            }
        };
    }


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
            if (!org) {
                const UserDoc = await this.UserRepository.findOne({
                    filter: { _id: user },
                    select: ["orgId"],
                    session
                })


                org = UserDoc.orgId;
            }

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
                    await this.startFreeTrial({
                        org,
                        session,
                    });
                    break;
                case PLAN.PAID:
                    return this.startPaidSubscription(org);
                    break;
                default:
                    throw new NotFoundException("Invalid Plan");
                    break;
            }   
            await session.commitTransaction();
        } catch (e: any) {
            await session.abortTransaction();
        } finally {
            await session.endSession();
        }
    }
}