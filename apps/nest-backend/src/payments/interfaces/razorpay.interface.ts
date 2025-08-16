export interface RazorpayWebhookEvent {
    account_id: string;
    contains: string[];
    created_at: number;
    entity: 'event';
    event: RazorpayWebhookEventType;
    payload: RazorpayWebhookPayload;
}
  
export type RazorpayWebhookEventType =
  | 'payment_link.paid'
  | 'payment_link.partially_paid'
  | 'payment_link.cancelled'
  | 'payment_link.expired';
  

export interface RazorpayWebhookPayload {
    payment_link?: RazorpayPaymentLinkEntity;
    order?: RazorpayOrderEntity;
    payment?: RazorpayPaymentEntity;
}

export interface RazorpayPaymentLinkEntity {
    entity: {
      id: string;
      short_url: string;
      status: 'created' | 'paid' | 'partially_paid' | 'cancelled' | 'expired';
      amount: number;
      amount_paid: number;
      currency: string;
      description?: string;
      reference_id?: string;
      customer?: {
        name?: string;
        email?: string;
        contact?: string;
      };
      created_at: number;
      updated_at: number;
      cancelled_at: number;
      expired_at: number;
      expire_by: number;
      accept_partial: boolean;
      first_min_partial_amount: number;
      upi_link: boolean;
      whatsapp_link: boolean;
      callback_url?: string;
      callback_method?: string;
      notes?: Record<string, any>;
      notify?: {
        email: boolean;
        sms: boolean;
        whatsapp: boolean;
      };
      reminder_enable: boolean;
      reminders?: {
        status: string;
      };
      order_id?: string;
      user_id?: string;
    };
  }
  
  export interface RazorpayOrderEntity {
    entity: {
      id: string;
      amount: number;
      amount_paid: number;
      amount_due: number;
      currency: string;
      status: 'created' | 'attempted' | 'paid' | 'captured';
      receipt: string;
      created_at: number;
      updated_at: number;
      partial_payment: boolean;
      first_payment_min_amount?: number;
      notes?: Record<string, any>;
      product_id: string;
      product_type: string;
      merchant_id: string;
      public_key: string;
    };
  }
  
  export interface RazorpayPaymentEntity {
    entity: {
      id: string;
      amount: number;
      currency: string;
      status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
      method: string;
      description?: string;
      email?: string;
      contact?: string;
      created_at: number;
      fee: number;
      tax: number;
      fee_bearer: string;
      order_id: string;
      international: boolean;
      refund_status?: string;
      amount_refunded: number;
      amount_transferred: number;
      error_code?: string;
      error_description?: string;
      error_reason?: string;
      error_source?: string;
      error_step?: string;
      notes?: Record<string, any>;
      upi?: {
        vpa: string;
        payer_account_type: string;
      };
      vpa?: string;
      card?: any;
      bank?: any;
      wallet?: any;
      acquirer_data?: Record<string, any>;
    };
  }


