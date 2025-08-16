import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";
import { TransactionRepository } from "./repositories/transaction.repository";
import { OrderRepository } from "./repositories/order.repository";
import { COLLECTION_NAMES } from "src/common/constants";
import { OrderSchema } from "./Model/order.model";
import { TransactionSchema } from "./Model/transaction.model";
import { MongooseModule } from "@nestjs/mongoose";
import { PaymentFactory } from "./payment.factory";
import { RazorPayPaymentStrategy } from "./strategies/razorpay/razorpay.strategy";
import { RazorPayBaseApi } from "./strategies/razorpay/razorpay-base.api";
import { PaymentHookService } from "./payment-hook.service";


const PaymentModules = [
    {
        name: COLLECTION_NAMES.Payments.order,
        schema: OrderSchema,
    }, {
        name: COLLECTION_NAMES.Payments.transaction,
        schema: TransactionSchema, 
    }
]

@Module({
    imports: [
        MongooseModule.forFeature(PaymentModules),
        ConfigModule
    ],
    providers: [
        PaymentsService,
        TransactionRepository, 
        OrderRepository,
        PaymentFactory,
        RazorPayPaymentStrategy,
        RazorPayBaseApi,
        PaymentHookService,
    ],
    controllers: [PaymentsController],
    exports: [TransactionRepository, OrderRepository, PaymentsService, RazorPayPaymentStrategy]
})
export class PaymentModule{
}