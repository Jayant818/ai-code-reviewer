import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { OrganizationRepository } from './organization.repository';

@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService, OrganizationRepository],
  exports:[OrganizationService,OrganizationRepository]
})
export class OrganizationModule {}
