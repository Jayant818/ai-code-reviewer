import { InternalServerErrorException, Logger } from "@nestjs/common";
import {
    IPaymentProvider,
    IPaymentProviderCreatePaymentUrlParams,
    IPaymentProviderCreatePaymentUrlResponse,
    IRazorpayPaymentLinkRequest,
    IRazorpayPaymentLinkResponse
} from "../../interfaces/payment-provider.interface";
import { RazorPayBaseApi } from "./razorpay-base.api";
import { ConfigService } from "@nestjs/config";
import { TransactionRepository } from "src/payments/repositories/transaction.repository";
import { PAYMENT_PROVIDERS } from "src/payments/Model/order.model";
import { TRANSACTION_STATUS, TRANSACTION_TYPES } from "src/payments/Model/transaction.model";
import { AppInjectable } from "@app/framework";

@AppInjectable()
export class RazorPayPaymentStrategy extends RazorPayBaseApi implements IPaymentProvider {
    private readonly logger = new Logger(RazorPayPaymentStrategy.name);

    constructor(
        configService: ConfigService,
        private readonly transactionRepository: TransactionRepository,
    ) {
        super(configService);
    }

    async createPaymentUrl({
        orderId,
        amount,
        currency,
        redirectUrl,
        buyer,
        clientIp,
        orgId,
    }: IPaymentProviderCreatePaymentUrlParams): Promise<IPaymentProviderCreatePaymentUrlResponse> {
        try {

            const transaction = await this.transactionRepository.createTransaction({
                data: {
                    order: orderId,
                    amount: amount,
                    currency: currency,
                    paymentProvider: PAYMENT_PROVIDERS.RAZORPAY,
                    clientIp: clientIp || null,
                    conversionRate: null,
                    country: 'IN',
                    status: TRANSACTION_STATUS.CREATED,
                    providerTransactionId: null,
                    type: TRANSACTION_TYPES.PAYMENT,
                    metaData: {
                        buyer,
                        orgId,
                    }
                }
            })

            console.log("Transaction created", transaction);
    
            if (!transaction) {
                throw new InternalServerErrorException(`Failed to create transaction for order ${orderId}`);
            }

            const redirectUrlObject = new URL(redirectUrl);
            redirectUrlObject.searchParams.set('transactionId', transaction._id.toString() ?? '');

            const requestBody: IRazorpayPaymentLinkRequest = {
                amount: Math.floor(transaction.amount * 100),
                currency: transaction.currency,
                accept_partial: false,
                upi_link: false,
                description: "Vibe Lint Subscription",
                reference_id: transaction._id.toString(),
                customer: {
                    name: buyer.name,
                    email: buyer.email,
                    contact: buyer?.contact ?? undefined, 
                },
                notify: {
                    sms: false,
                    email: false
                },
                notes: {
                    transactionId: transaction._id.toString()
                },
                callback_url: redirectUrlObject.toString(),
                callback_method: 'get'
            };

            this.logger.log("Razorpay Payment Link Request Body", requestBody);

            const response = await this.request<IRazorpayPaymentLinkResponse>({
                url: '/payment_links',
                method: 'POST',
                data: JSON.stringify(requestBody),
            });

            this.logger.log(`Razorpay Payment Link created: ${response.short_url}`);

            return {
                url: response.short_url,
                transactionId: transaction._id.toString(),
            };
        } catch (error: any) {
            this.logger.error("Failed to create Razorpay payment link", error?.response?.data || error.message || error);
            throw new Error("Failed to create Razorpay payment link. Please try again later.");
        }
    }
}
