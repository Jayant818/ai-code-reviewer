import { AppInjectable } from "@app/framework";
import { MongooseTypes } from "@app/types";
import { IPaymentProviders, ORDER_STATUS } from "./Model/order.model";
import { TransactionRepository } from "./repositories/transaction.repository";
import { Inject, InternalServerErrorException } from "@nestjs/common";
import { PaymentFactory } from "./payment.factory";
import { IBuyer } from "./interfaces/payment-provider.interface";
import { RazorPayPaymentStrategy } from "./strategies/razorpay/razorpay.strategy";
import { IPaymentService } from "./interfaces/payment-service.interface";
import { IOrderRepository } from "./interfaces/order-repository.interface";

@AppInjectable()
export class PaymentsService implements IPaymentService{
    constructor(
        private readonly transactionRepository: TransactionRepository,
        @Inject(IOrderRepository)
        private readonly orderRepository: IOrderRepository,
        private readonly paymentFactory: PaymentFactory,
        private readonly razorPayStrategy: RazorPayPaymentStrategy,
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
        try {
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

            console.log("Order", order);

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

            return paymentUrl;

        } catch (e) {
            console.error("Error creating payment url", e);
            throw new InternalServerErrorException(`Failed to create payment url: ${e.message}`);
        }

    }

    
}