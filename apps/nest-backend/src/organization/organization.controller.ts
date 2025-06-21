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
  async getOrganizationSubscription(@Query() { orgId }: GetOrgSubscriptionDTO) { 
    console.log("aaya", orgId);
    return this.organizationService.getOrganzationSubscription(orgId);
  }

  @Post("/subscription")
  async createSubscription(
    @Req() req,
    @Body() { type }: createOrganizationDTO
  ) {
    console.log("Hit");
    return this.orgSubscriptionService.createSubscription({
      plan:type,
      user: new MongooseTypes.ObjectId(req.user.id),
      org: req.user.org ? new MongooseTypes.ObjectId(req.user.org) : null,
    });
  }
}
