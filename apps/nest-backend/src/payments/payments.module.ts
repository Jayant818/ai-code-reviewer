import { Module } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";
import { TransactionRepository } from "./repositories/transaction.repository";
import { OrderRepository } from "./repositories/order.repository";
import { COLLECTION_NAMES } from "src/common/constants";
import { OrderSchema } from "./Model/order.model";
import { TransactionSchema } from "./Model/transaction.model";
import { MongooseModule } from "@nestjs/mongoose";


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
        MongooseModule.forFeature(PaymentModules)
    ],
    providers: [PaymentsService,TransactionRepository, OrderRepository],
    controllers: [PaymentsController],
    exports: [TransactionRepository, OrderRepository, PaymentsService]
})
export class PaymentModule{
}