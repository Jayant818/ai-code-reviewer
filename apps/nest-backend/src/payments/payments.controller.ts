import { AppController } from "@app/framework";
import { Get, Param, Req } from "@nestjs/common";
import { getPaymentUrlDTO } from "./DTO/get-payment-url.dto";
import { PaymentsService } from "./payments.service";

@AppController('payments')
export class PaymentsController { 
    constructor(
        private readonly paymentService: PaymentsService
    ) { }
}