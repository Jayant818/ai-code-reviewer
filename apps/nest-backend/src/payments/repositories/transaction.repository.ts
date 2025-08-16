import { AppInjectable } from "@app/framework";
import { Transaction, TransactionDocument } from "../Model/transaction.model";
import { ClientSession } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { COLLECTION_NAMES } from "src/common/constants";
import { MongooseModel } from "@app/types";

@AppInjectable()
export class TransactionRepository{
    constructor(
        @InjectModel(COLLECTION_NAMES.Payments.transaction)
        private readonly transactionModel: MongooseModel<TransactionDocument>
    ) {
    }

    async startSession(): Promise<ClientSession> {
        return this.transactionModel.db.startSession();
    }

    async createTransaction({
        data,
        session
    }: {
        data: Partial<Transaction>;
        session?: ClientSession;
    }) {
        const query = new this.transactionModel(data);
        return query.save({ session });
    }

    async findOne<k extends keyof Transaction>({
        filter,
        select,
        populate = [],
        session,
    }: {
        filter: Record<k, Transaction[k]>;
        select?: string[];
        populate?: ({ path: string, select: string } | string)[];
        session?: ClientSession;
    }):Promise<Transaction | null> {
        const query = this.transactionModel.findOne(filter);
        
        if (select) {
            query.select(select.join(' '));
        }

        if (populate) {
            populate.forEach((item) => {
                typeof item === 'string' ? query.populate(item) : query.populate({ path: item.path, select: item.select });
            })
        }

        if (session) {
            query.session(session);
        }

        return query.lean<Transaction>().exec();
    }

    async findByWebhookEventId(webhookEventId: string): Promise<Transaction | null> {
        return this.transactionModel.findOne({ webhookEventId }).lean<Transaction>().exec();
    }

    async updateOne<k extends keyof Transaction>({
        filter,
        update,
        session,
    }: {
        filter: Record<k, Transaction[k]>;
        update: Record<string, any>;
        session?: ClientSession;
    }) {
        const query = this.transactionModel.findOneAndUpdate(filter, update);

        if(session){
            query.session(session);
        }

        return query.lean<Transaction>().exec();
    }
}