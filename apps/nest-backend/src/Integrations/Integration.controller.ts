import { AppController } from "@app/framework";
import { IntegrationService } from "./Integration.service";
import { IntegrationRepository } from "./Integration.repository";
import { Get, Query, Req } from "@nestjs/common";
import { MongooseTypes } from "@app/types";
import { getIntegrationDTO } from "./DTO/get-integration.dto";

@AppController("/integration")
export class IntegrationController{
    constructor(
        private readonly integrationRepository: IntegrationRepository,
    ){}
    @Get()
    async getIntegration(@Query() {orgId} : getIntegrationDTO) {
        return this.integrationRepository.findOne({
            filter: {
                orgId: new MongooseTypes.ObjectId()
            }
        })
    }
}