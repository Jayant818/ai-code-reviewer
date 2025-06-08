import { AppInjectable } from "@app/framework";
import { InjectModel } from "@nestjs/mongoose";
import { Integration, INTEGRATION_MODEL, IntegrationDocument } from "./model/app-installation.model";
import { COLLECTION_NAMES } from "src/common/constants";
import { MongooseModel } from "@app/types";

@AppInjectable()
export class IntegrationRepository{
    constructor(
        @InjectModel(COLLECTION_NAMES.Integrations.Integration)
        private readonly integrationModel: MongooseModel<IntegrationDocument>
    ) { }
    
    async createIntegration(data: Integration) {
        const newIntegration = await this.integrationModel.create(data);
    }
}