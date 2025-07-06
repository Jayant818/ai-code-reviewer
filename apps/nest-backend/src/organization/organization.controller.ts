import { Controller, Post, Body, Req, Get, Query } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { createOrganizationDTO } from './DTO/create-org-subscription.dto';
import { OrgSubscriptionService } from './subscriptions/org-subscription.service';
import { Public } from '@app/framework';
import { MongooseTypes } from '@app/types';
import { GetOrgSubscriptionDTO } from './DTO/get-org-subscription.dto';

@Controller('organization')
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly orgSubscriptionService: OrgSubscriptionService,
  ) { }
  
  @Get('/subscription')
  async getOrganizationSubscription(@Req() req) { 
    return this.organizationService.getOrganzationSubscription({
      orgId: req.user.orgId ? new MongooseTypes.ObjectId(req.user.orgId) : null,
    });
  }

  @Post("/subscription")
  async handleSubscriptionSelection(
    @Req() req,
    @Body() { type }: createOrganizationDTO
  ) {
    try {   
      this.orgSubscriptionService.handleSubscriptionSelection({
        plan:type,
        userId: new MongooseTypes.ObjectId(req.user.id),
        org: req.user.orgId ? new MongooseTypes.ObjectId(req.user.orgId) : null,
      });

      return {
        success: true,
        message: "Subscription started",
      };
    } catch (error) {
      return {
        success: false,
        message: error?.message || "Failed to start subscription",
      };
    }
  }
}
