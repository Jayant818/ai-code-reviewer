import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './DTO/create-organization.dto';
import { UpdateOrganizationDto } from './DTO/update-organization.dto';
import { createOrganizationDTO } from './DTO/create-org-subscription.dto';
import { OrgSubscriptionService } from './subscriptions/org-subscription.service';
import { Public } from '@app/framework';

@Controller('organization')
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly orgSubscriptionService: OrgSubscriptionService,
  ) {}

  @Public()
  @Post("/subscription")
  async createSubscription(
    @Req() req,
    @Body() { plan }: createOrganizationDTO
  ) {
    return this.orgSubscriptionService.createSubscription({
      plan,
      user: req.user.id,
      org: req.user.org,
    });
  }
}
