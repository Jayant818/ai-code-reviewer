import { Module } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";

@Module({
    imports: [],
    providers: [PaymentsService],
    controllers: [PaymentsController],
    exports: []
})
export class PaymentModule{

}