import { Module } from "@nestjs/common";
import { IntegrationController } from "./Integration.controller";
import { IntegrationRepository } from "./Integration.repository";
import { IntegrationService } from "./Integration.service";
import { COLLECTION_NAMES } from "src/common/constants";
import { IntegrationSchema } from "./model/app-installation.model";
import { MongooseModule } from "@nestjs/mongoose";

const IntegrationModules = [
    {
        name: COLLECTION_NAMES.Integrations.Integration,
        schema: IntegrationSchema,
    }
]

@Module({
    imports: [
        MongooseModule.forFeature(IntegrationModules)
    ],
    controllers: [IntegrationController],
    providers: [IntegrationRepository,IntegrationService],
    exports:[IntegrationRepository, IntegrationService]
})
export class IntegrationModule{ }