import { Controller, Post, Body, Req } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { createOrganizationDTO } from './DTO/create-org-subscription.dto';
import { OrgSubscriptionService } from './subscriptions/org-subscription.service';
import { Public } from '@app/framework';
import { MongooseTypes } from '@app/types';

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
    console.log("user", req.user);
    return this.orgSubscriptionService.createSubscription({
      plan,
      user: new MongooseTypes.ObjectId('684ea2ff08a65e10244d18dd'),
      org: new MongooseTypes.ObjectId('684ea39a08a65e10244d18e1'),
    });
  }
}
