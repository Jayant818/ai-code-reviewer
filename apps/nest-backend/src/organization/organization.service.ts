import { MongooseTypes } from '@app/types';
import { OrganizationRepository } from './organization.repository';
import { AppInjectable } from '@app/framework';
import { PipelineStage } from 'mongoose';
import { COLLECTION_NAMES } from 'src/common/constants';

@AppInjectable()
export class OrganizationService {

  constructor(private readonly OrganizationRepository: OrganizationRepository) {
  }

  async getOrganizationModel(orgId: MongooseTypes.ObjectId) { 
    const orgDoc = await this.OrganizationRepository.findOne({ 
      filter: { _id: orgId },
      select: [
        "Model",
      ]
      })
    return orgDoc;
  }

  async getOrganzationSubscription(orgId:MongooseTypes.ObjectId) {
   const orgSubscriptionPipeline: PipelineStage[] = [
  {
    $match: {
      _id: new MongooseTypes.ObjectId(orgId),
    }
  },
  {
    $project: {
      name: 1,
      Model: 1,
      reviewsLeft: 1,
      githubId: 1,
    }
  },
  {
    $lookup: {
      from: COLLECTION_NAMES.Organization.subscription,
      localField: "_id",
      foreignField: "orgId",
      as: "subscription",
      pipeline: [
        {
          $project: {
            plan: 1,
            expiresAt: 1,
            billingPeriod: 1
          }
        }
      ]
    }
  },
  {
    $addFields: {
      subscription: { $arrayElemAt: ["$subscription", 0] }, // pick the first subscription
    }
  },
  {
    $addFields: {
      status: {
        $cond: {
          if: {
            $gt: [
              "$subscription.expiresAt",
              new Date() // comparing Dates directly
            ]
          },
          then: "active",
          else: "expired"
        }
      }
    }
  }
];


    return await this.OrganizationRepository.aggregateOrgModel(orgSubscriptionPipeline);
  }
}
