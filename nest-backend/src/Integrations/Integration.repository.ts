import { AppInjectable } from "@app/framework";
import { InjectModel } from "@nestjs/mongoose";
import { Integration, INTEGRATION_MODEL, IntegrationDocument } from "./model/app-installation.model";
import { COLLECTION_NAMES } from "src/common/constants";
import { MongooseModel } from "@app/types";
import { ClientSession } from "mongoose";

@AppInjectable()
export class IntegrationRepository{
    constructor(
        @InjectModel(COLLECTION_NAMES.Integrations.Integration)
        private readonly integrationModel: MongooseModel<IntegrationDocument>
    ) { }

    async findOne<k extends keyof Integration>({
        filter,
        populate,
        select,
        session,
    }: {
        filter: Record<k, Integration[k]>;
        populate?: (string | { path: string; select?: string[]; })[];
        select?: string[];
        session?: ClientSession;
    }):Promise<IntegrationDocument | null> {
        const query = this.integrationModel.findOne(filter);
        
        if (select) { 
            query.select(select);
        }

        if (populate) {
            populate.forEach(item => typeof item === 'string' ? query.populate(item) : query.populate(item.path, item.select));
        }

        if (session) {
            query.session(session);
        }

        return query.exec();
    }
    
    async createIntegration(data: Integration) {
        const newIntegration = await this.integrationModel.create(data);
    }
}