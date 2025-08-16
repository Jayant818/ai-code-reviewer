import { AppController, Public } from "@app/framework";
import {  Get, HttpStatus, Logger, Param, Post, Req, Res } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { Request } from "express";
import { PaymentHookService } from "./payment-hook.service";

@AppController('payments')
export class PaymentsController {
    private readonly logger = new Logger(PaymentsController.name);
    constructor(
        private readonly paymentService: PaymentsService,
        private readonly paymentHookService: PaymentHookService,
    ) { }

    @Public()
    @Post('razorpay')
    async razorpayHook(@Req() req: Request, @Res() res: Response) {
        this.logger.log("Razorpay hook received");
        
        try {
            const signature = req.headers['x-razorpay-signature'] as string;

            const rawbody = req.body.toString('utf-8'); // Convert the raw body to a string
            
            const payload = JSON.parse(rawbody); // Parse the JSON body

            const response = await this.paymentHookService.verifyAndProcessRazorPayWebhook({signature, rawbody,payload});

            return {
                statusCode: HttpStatus.OK,
                message: response,
            }
        } catch (error) {
            this.logger.error(`Error while Processing Razorpay WEBHOOK: ${error.message}`, error.stack);

            // Return 200 to Razorpay even on error to prevent retries
            // (we'll handle the error internally)
        }
    }
}