import { forwardRef, Module } from "@nestjs/common";
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
import { OrganizationRepository } from "src/organization/organization.repository";
import { OrganizationModule } from "src/organization/organization.module";
import { IPaymentService } from "./interfaces/payment-service.interface";
import { IOrderRepository } from "./interfaces/order-repository.interface";
import { IOrganizationRepository } from "src/organization/interfaces/organization-repository.interface";


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
        ConfigModule,
        forwardRef(() => OrganizationModule)
    ],
    providers: [
        PaymentsService,
        TransactionRepository, 
        PaymentFactory,
        RazorPayPaymentStrategy,
        RazorPayBaseApi,
        OrderRepository,
        PaymentHookService,

        // {
        //     provide: IOrganizationRepository, useClass: OrganizationRepository
        // },
        {
            provide: IPaymentService, useClass: PaymentsService
        },
        {
            provide: IOrderRepository, useClass: OrderRepository
        }
    ],
    controllers: [PaymentsController],
    exports: [IPaymentService,IOrderRepository,TransactionRepository, PaymentsService, RazorPayPaymentStrategy,OrderRepository]
})
export class PaymentModule{
}