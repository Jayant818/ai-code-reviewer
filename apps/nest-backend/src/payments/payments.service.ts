import { AppInjectable } from "@app/framework";
import { MongooseTypes } from "@app/types";
import { IPaymentProviders, ORDER_STATUS } from "./Model/order.model";
import { TransactionRepository } from "./repositories/transaction.repository";
import { TRANSACTION_STATUS, TRANSACTION_TYPES } from "./Model/transaction.model";
import { OrderRepository } from "./repositories/order.repository";
import { InternalServerErrorException } from "@nestjs/common";
import { PaymentFactory } from "./payment.factory";
import { IBuyer } from "./interfaces/payment-provider.interface";

@AppInjectable()
export class PaymentsService{
    constructor(
        private readonly transactionRepository: TransactionRepository,
        private readonly orderRepository: OrderRepository,
        private readonly paymentFactory: PaymentFactory,
    ) { }
    
    async createPaymentUrl({
        provider,
        amount,
        currency,
        orgId,
        redirectUrl,
        orderId,
        clientIp,
        buyer,
    }: {
        provider: IPaymentProviders;
        amount: number;
        currency: string;
        orgId: MongooseTypes.ObjectId;
        redirectUrl: string;
        orderId: MongooseTypes.ObjectId;
        clientIp?: string;
        buyer: IBuyer;
    }) {

        // get the order details
        const order = await this.orderRepository.findOne({
            filter: {
                _id: orderId,
            }
        })

        if (!order) {
            throw new InternalServerErrorException(`Order with id ${orderId} not found`);
        }

        if (order.successfulTransactionId) { 
            throw new InternalServerErrorException(`Order is already paid`);
        }

        const strategy = this.paymentFactory.getStrategy(provider);

        const paymentUrl = await strategy.createPaymentUrl({
            amount: amount,
            currency: currency,
            orgId: orgId,
            orderId: order._id,
            clientIp: clientIp || null,
            redirectUrl,
            buyer,
        });


    }

    
}