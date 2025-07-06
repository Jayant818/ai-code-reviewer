import { MongooseTypes } from "@app/types";

export interface IRazorpayPaymentLinkRequest{
  amount: number;
  currency?: string;
  accept_partial?: boolean;
  first_min_partial_amount?: number;
  upi_link?: boolean;
  description?: string;
  reference_id?: string;
  customer?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  expire_by?: number;
  notify?: {
    sms?: boolean;
    email?: boolean;
  };
  notes?: Record<string, string>;
  callback_url?: string;
  callback_method?: string;
  reminder_enable?: boolean;
}

export interface IRazorpayPaymentLinkResponse {
    id: string;
    short_url: string;
    status: string;
    amount: number;
    currency: string;
    description?: string;
    reference_id?: string;
    customer?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    expire_by?: number;
    created_at: number;
    updated_at: number;
    callback_url?: string;
    callback_method?: string;
    accept_partial?: boolean;
    first_min_partial_amount?: number;
    upi_link?: boolean;
    notes?: Record<string, string>;
    notify?: {
      sms?: boolean;
      email?: boolean;
    };
    reminder_enable?: boolean;
    amount_paid?: number;
    cancelled_at?: number;
    expired_at?: number;
    payments?: any[];
    user_id?: string;
}


export interface IBuyer{
    name: string;
    email: string;
    contact?: string; 
}

export interface IPaymentProviderCreatePaymentUrlParams { 
    redirectUrl: string;
    buyer: IBuyer;
    orderId: MongooseTypes.ObjectId;
    amount: number;
    currency: string;
    clientIp?: string;
    orgId?: MongooseTypes.ObjectId; 
}

export interface IPaymentProviderCreatePaymentUrlResponse{
    url: string;
    transactionId: string;
}

export interface IPaymentProvider {
    createPaymentUrl(params:IPaymentProviderCreatePaymentUrlParams):Promise<IPaymentProviderCreatePaymentUrlResponse>
}

