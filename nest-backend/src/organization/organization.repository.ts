import { AppInjectable } from "@app/framework";
import { MongooseDocument, MongooseModel } from "@app/types";
import { InjectModel } from "@nestjs/mongoose";
import { COLLECTION_NAMES } from "src/common/constants";
import { OrganizationTrialsDocument } from "./trials/org-trials.model";
import { Organization, OrganizationDocument } from "./Model/organization.model";
import { ClientSession } from "mongoose";

@AppInjectable()
export class OrganizationRepository{
    constructor(
        @InjectModel(COLLECTION_NAMES.Organization.organization)
        private readonly organizationModel: MongooseModel<OrganizationDocument>
    ) {}
   async createOrganization(data: Partial<Organization>,session?:ClientSession): Promise<OrganizationDocument>{
       const org = new this.organizationModel(data);
       await org.save({session});
       return org;
   }
}