import { AppInjectable } from "@app/framework";
import { Order, OrderDocument } from "../Model/order.model";
import { ClientSession } from "mongoose";
import { MongooseModel } from "@app/types";
import { InjectModel } from "@nestjs/mongoose";
import { COLLECTION_NAMES } from "src/common/constants";
import { IOrderRepository } from "../interfaces/order-repository.interface";

@AppInjectable()
export class OrderRepository implements IOrderRepository{
    constructor(
        @InjectModel(COLLECTION_NAMES.Payments.order)
        private readonly orderModel: MongooseModel<OrderDocument>
    ) { }

    async createOrder({ orderData, session }: { orderData: Partial<Order>;  session?: ClientSession }) {
        const order = new this.orderModel(orderData);
        return order.save({ session });
    }

    async findOne<k extends keyof Order>({
        filter,
        select,
        populate = [],
        session,
    }: {
        filter: Record<k, Order[k]>;
        select?: string[];
        populate?: ({ path: string, select: string } | string)[];
        session?: ClientSession;
    }):Promise<Order | null> {
        const query = this.orderModel.findOne(filter);

        if (select) {
            query.select(select.join(''));
        }

        if (populate) {
            populate.forEach((item) => {
                typeof item === 'string' ? query.populate(item) : query.populate({ path: item.path, select: item.select });
            })
        }

        if (session) {
            query.session(session);
        }

        return query.lean<Order>().exec();
    }

    async updateOne<k extends keyof Order>({
        filter,
        update,
        session
    }: {
        filter: Record<k, Order[k]>;
        update: Record<string, any>;
        session?: ClientSession;
    }):Promise<Order | null> {
        const query = this.orderModel.findByIdAndUpdate(filter, update);
        if (session) {
            query.session(session);
        }
        return query.lean<Order>().exec();
    }
}