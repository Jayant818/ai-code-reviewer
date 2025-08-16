import {  AppInjectable } from "@app/framework";
import { BadRequestException, InternalServerErrorException, Logger, NotImplementedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import { RazorpayWebhookEvent, RazorpayWebhookPayload } from "./interfaces/razorpay.interface";
import { MongooseTypes } from "@app/types";
import { TransactionRepository } from "./repositories/transaction.repository";
import { OrderRepository } from "./repositories/order.repository";
import { ORDER_STATUS } from "./Model/order.model";
import { Transaction, TRANSACTION_STATUS } from "./Model/transaction.model";
import { ClientSession } from "mongoose";

@AppInjectable()
export class PaymentHookService {
    private readonly logger = new Logger(PaymentHookService.name);
    private razorpayEventHandlerMap = new Map();
    
    constructor(
        private readonly configService: ConfigService,
        private readonly transactionRepository: TransactionRepository,
        private readonly orderRepository: OrderRepository,
    ) { 
        this.razorpayEventHandlerMap.set("payment_link.paid",this.handleRazorpayPaymentLinkPaid);
    }

    private async validateRazorpayWebookSecret({signature,rawbody}:{ signature: string ,rawbody:string}) {
        try {
            this.logger.log('Validating Razorpay Webhook Secret', {
                signature,
            });

            const secret = this.configService.get("RAZORPAY_WEBHOOK_SECRET");

            const expectedSignature = crypto.createHmac('sha256', secret).update(rawbody).digest('hex');

            return crypto.timingSafeEqual(Buffer.from(signature),Buffer.from(expectedSignature));
        } catch (error) { 
            this.logger.error("Error validating Razorpay Webhook Secret", error);
            return false;
        }
    }

    private async handleRazorpayPaymentLinkPaid(eventPayload:RazorpayWebhookPayload, eventId: string) {
        const { payment_link, order, payment } = eventPayload;

        if (!payment_link || !order || !payment) {
            throw new BadRequestException(
            'Missing required data for payment_link.paid event',
            );
        }

        const paymentLinkId = payment_link.entity.id;
        const orderId = order.entity.id;
        const paymentId = payment.entity.id;

        const VibeLintTransactionId = new MongooseTypes.ObjectId(payment_link.entity.reference_id);

        // Check for idempotency first
        const existingTransaction = await this.transactionRepository.findByWebhookEventId(eventId);

        if (existingTransaction) {
            this.logger.log(`Webhook event ${eventId} already processed for transaction ${existingTransaction._id}`);
            return "Payment already processed";
        }

        const transaction = await this.transactionRepository.findOne({
            filter: {
                _id: VibeLintTransactionId,
            }
        });

        if(!transaction) {
            this.logger.error(`Transaction not found for payment link: ${paymentLinkId}`);
            throw new BadRequestException(`Transaction not found for payment link: ${paymentLinkId}`);
        }

        if (
            transaction.status !== 'created' ||
            transaction.paymentProvider !== 'razorpay-connect'
          ) {
            throw new BadRequestException({
              status: transaction.status,
              error: 'Transaction was not initiated with Razorpay',
              paymentProvider: transaction.paymentProvider,
            });
        }

        const vibeLintOrder = await this.orderRepository.findOne({
            filter: {
                _id:transaction.order
            },
            populate: ["successfulTransaction"]
        });

        if (!vibeLintOrder) {
            throw new InternalServerErrorException('Order not found');
        }

        // Check if order is already paid
        if (vibeLintOrder.status === ORDER_STATUS.PAID) {
            this.logger.log(`Order ${vibeLintOrder._id} is already paid`);
            return "Order already paid";
        }

        this.logger.debug('Processing Razorpay payment link paid', {
            paymentLinkId,
            orderId,
            paymentId,
            amount: payment.entity.amount,
            currency: payment.entity.currency,
            vibeLintOrder,
            eventId,
          });

        try {
            // Use database transaction for atomicity
            const session = await this.transactionRepository.startSession();
            
            try {
                await session.withTransaction(async () => {
                    // Update transaction with idempotency fields
                    await this.transactionRepository.updateOne({
                        filter: { _id: transaction._id },
                        update: {
                            $set: {
                                status: TRANSACTION_STATUS.PAID,
                                providerTransactionId: paymentId.toString(),
                                webhookEventId: eventId,
                                webhookProcessedAt: new Date(),
                                webhookAttemptCount: (transaction.webhookAttemptCount || 0) + 1,
                            }
                        },
                        session
                    });

                    // Update order with atomic operation - only if not already paid
                    const orderUpdateResult = await this.orderRepository.updateOne({
                        filter: { 
                            _id: transaction.order,
                        },
                        update: {
                            $set: {
                                successfulTransactionId: transaction._id,
                                status: ORDER_STATUS.PAID
                            }
                        },
                        session
                    });

                    if (!orderUpdateResult) {
                        throw new Error('Failed to update order status');
                    }
                });

                this.logger.log(`Successfully processed payment for transaction ${transaction._id}`);
                return "Payment Processed Successfully";
            } finally {
                await session.endSession();
            }
        } catch (error) {
            this.logger.error("Error Processing Razorpay payment", error);
            throw error;
        }
    }

    private async processRazorPayWebhook(body: RazorpayWebhookEvent) {
        const { event, payload: eventPayload, account_id } = body;
        const eventId = `${account_id}_${body.created_at}_${event}`; // Create unique event ID

        this.logger.log(`Processing Razorpay webhook event: ${event}`, {
            paymentLinkId: eventPayload.payment_link?.entity.id,
            orderId: eventPayload.order?.entity.id,
            paymentId: eventPayload.payment?.entity.id,
            eventId,
        });

        const handler =  this.razorpayEventHandlerMap.get(event);

        if (!handler) {
            this.logger.error("Unhandled Razorpay webhook event");
            throw new NotImplementedException(`Unhandled Event Type ${event}`)
        }

        return handler(eventPayload, eventId);
    }

    async verifyAndProcessRazorPayWebhook({ signature, rawbody, payload }: { signature: string, rawbody: string, payload: RazorpayWebhookEvent }) {
        try {
            // Validate webhook signature
            const isValid = await this.validateRazorpayWebookSecret({ signature, rawbody });
            
            if (!isValid) {
            throw new BadRequestException("Invalid Webhook Signature");
            }

            return this.processRazorPayWebhook(payload);
        } catch (error) { 
            this.logger.error("Error processing Razorpay webhook", error);
            throw error;
        }
    }
}