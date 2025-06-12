import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { OrganizationRepository } from './organization.repository';
import { COLLECTION_NAMES } from 'src/common/constants';
import { OrganizationSchema } from './Model/organization.model';
import { MongooseModule } from '@nestjs/mongoose';


const OrganizationModules = [
    {
        name: COLLECTION_NAMES.Organization.organization,
        schema: OrganizationSchema,
    }
]

@Module({
  imports:[MongooseModule.forFeature(OrganizationModules)],
  controllers: [OrganizationController],
  providers: [OrganizationService, OrganizationRepository],
  exports:[OrganizationService,OrganizationRepository]
})
export class OrganizationModule {}
