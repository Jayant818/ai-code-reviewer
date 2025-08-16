import { AppInjectable } from "@app/framework";
import { RazorPayPaymentStrategy } from "./strategies/razorpay/razorpay.strategy";
import { IPaymentProviders, PAYMENT_PROVIDERS } from "./Model/order.model";

@AppInjectable()
export class PaymentFactory{
    constructor(
        private readonly razorpayPaymentStrategy:RazorPayPaymentStrategy,
    ) {}

    getStrategy(provider: IPaymentProviders) {
        switch (provider) {
            case PAYMENT_PROVIDERS.RAZORPAY:
                return this.razorpayPaymentStrategy;
            default:
                throw new Error(`Payment provider ${provider} not supported`);
        }
    }
}