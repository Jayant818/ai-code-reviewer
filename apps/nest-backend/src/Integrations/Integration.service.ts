import { AppInjectable } from "@app/framework";
import { IntegrationRepository } from "./Integration.repository";
import { MongooseTypes } from "@app/types";
import { UnauthorizedException } from "@nestjs/common";

@AppInjectable()
export class IntegrationService{
    constructor(
        private readonly integrationRepository: IntegrationRepository

    ) { }
    
    async getOrgIdFromInstallationId(installationId: number) { 
        const integration = await this.integrationRepository.findOne({
            filter: {
                installationId
            },
            select: ['orgId']
        })

        return integration?.orgId;
    }

    async getIntegrationDetails({orgId}: {
        orgId: MongooseTypes.ObjectId | null;
    }) {
        if (!orgId) {
            throw new UnauthorizedException("Organization Id is required");
        }

        const integration = await this.integrationRepository.findOne({
            filter: {
                orgId,
            },
            select: [
                "installationId",
                "integratedBy"
            ]
        });

        return integration;
    }
}