import { AppController } from "@app/framework";
import { IntegrationService } from "./Integration.service";
import { Get, Req } from "@nestjs/common";
import { MongooseTypes } from "@app/types";

@AppController("/integration")
export class IntegrationController{
    constructor(
        private readonly integrationService: IntegrationService
    ){}
    @Get()
    async getIntegration(@Req() req) {
        const orgId = req.user.orgId ? new MongooseTypes.ObjectId(req.user.orgId) : null;

        return this.integrationService.getIntegrationDetails({
            orgId
        })
    }
}