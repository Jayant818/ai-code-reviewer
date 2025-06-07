import { Module } from "@nestjs/common";
import { IntegrationController } from "./Integration.controller";
import { IntegrationRepository } from "./Integration.repository";
import { IntegrationService } from "./Integration.service";

@Module({
    imports: [],
    controllers: [IntegrationController],
    providers: [IntegrationRepository,IntegrationService],
    exports:[IntegrationRepository]
})
export class IntegrationModule{ }