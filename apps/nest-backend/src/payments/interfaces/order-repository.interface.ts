import { ClientSession } from "mongoose";
import { Order } from "../Model/order.model";

export interface IOrderRepository{
    createOrder: ({ orderData, session }: { orderData: Partial<Order>; session?: ClientSession }) => Promise<Order>;
    findOne<k extends keyof Order>({
        filter,
        select,
        populate,
        session,
    }: {
        filter: Record<k, Order[k]>;
        select?: string[];
        populate?: ({ path: string, select: string } | string)[];
        session?: ClientSession;
    }): Promise<Order | null>;

    updateOne<k extends keyof Order>({
        filter,
        update,
        session
    }: {
        filter: Record<k, Order[k]>;
        update: Record<string, any>;
        session?: ClientSession;
    }): Promise<Order | null>;
}

export const IOrderRepository = Symbol("IOrderRepository");