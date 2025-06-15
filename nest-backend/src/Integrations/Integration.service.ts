import { AppInjectable } from "@app/framework";
import { IntegrationRepository } from "./Integration.repository";

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
}