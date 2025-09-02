import { RazorpayWebhookEvent, RazorpayWebhookPayload } from "./razorpay.interface";

export interface PaymentHookService{
    validateRazorpayWebookSecret: (webhookSecret: string, webhookSignature: string, payload: string) => boolean;
    handleRazorpayPaymentLinkPaid: (eventPayload: RazorpayWebhookPayload, eventId: string) => Promise<void>;
    processRazorPayWebhook: (body: RazorpayWebhookEvent) => Promise<void>;
    verifyAndProcessRazorPayWebhook: ({ signature, rawbody, payload }: { signature: string, rawbody: string, payload: RazorpayWebhookEvent }) => Promise<void>;
}