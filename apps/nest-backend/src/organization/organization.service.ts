import { Injectable } from '@nestjs/common';
import { MongooseTypes } from '@app/types';
import { OrganizationRepository } from './organization.repository';
import { AppInjectable } from '@app/framework';

@AppInjectable()
export class OrganizationService {

  constructor(private readonly OrganizationRepository: OrganizationRepository) {
  }

  async getOrganizationModel(orgId: MongooseTypes.ObjectId) { 
    const orgDoc = await this.OrganizationRepository.findOne({ 
      filter: { _id: orgId },
      select: [
        "LLM",
      ]
      })
    return orgDoc;
  }

  async getOrganzationSubscription(orgId:MongooseTypes.ObjectId) {
    const subscriptionDoc = await this.OrganizationRepository.findSubscription({
      filter: { orgId },
      select: [
        "plan",
        "billingPeriod",
        "expiresAt",
        "orgId",
      ]
    })

    if (Date.now() >= subscriptionDoc.expiresAt.getTime()) {
      throw new Error("Organization Subscription Expired");
    }

  //   status: "active" | "inactive" | "expired";
  //   reviewsRemaining: number;
  }
}
