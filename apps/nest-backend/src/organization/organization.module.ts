import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { OrganizationRepository } from './organization.repository';
import { COLLECTION_NAMES } from 'src/common/constants';
import { OrganizationSchema } from './Model/organization.model';
import { MongooseModule } from '@nestjs/mongoose';
import { OrgSubscriptionService } from './subscriptions/org-subscription.service';
import { OrganizationTrialsSchema } from './trials/org-trials.model';
import { OrganizationSubscriptionSchema } from './subscriptions/org-subscription.model';
import { orgSubscriptionLogsSchema } from './logs/org-subscription-logs.model';
import { UserModule } from 'src/user/user.module';
import { PlanSchema } from './Model/pricing-plan.model';
import { PaymentModule } from 'src/payments/payments.module';


const OrganizationModules = [
  {
    name: COLLECTION_NAMES.Organization.organization,
    schema: OrganizationSchema,
  },
  {
    name: COLLECTION_NAMES.Organization.availedTrials,
    schema:OrganizationTrialsSchema,
  },
  {
    name: COLLECTION_NAMES.Organization.subscription,
    schema:OrganizationSubscriptionSchema,
  }, {
    name: COLLECTION_NAMES.Organization.subscriptionLogs,
    schema:orgSubscriptionLogsSchema,
  }, {
    name: COLLECTION_NAMES.Plans.Plans,
    schema: PlanSchema,
  }

]

@Module({
  imports:[MongooseModule.forFeature(OrganizationModules),UserModule,PaymentModule],
  controllers: [OrganizationController],
  providers: [OrganizationService, OrganizationRepository,OrgSubscriptionService],
  exports:[OrganizationService,OrganizationRepository]
})
export class OrganizationModule {}
