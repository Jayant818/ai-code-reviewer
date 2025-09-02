import { MongooseTypes } from "@app/types";
import { IPaymentProviders } from "../Model/order.model";
import { IBuyer, IPaymentProviderCreatePaymentUrlResponse } from "./payment-provider.interface";

export interface IPaymentService{
  createPaymentUrl({
          provider,
          amount,
          currency,
          orgId,
          redirectUrl,
          orderId,
          clientIp,
          buyer,
      }: {
          provider: IPaymentProviders;
          amount: number;
          currency: string;
          orgId: MongooseTypes.ObjectId;
          redirectUrl: string;
          orderId: MongooseTypes.ObjectId;
          clientIp?: string;
          buyer: IBuyer;
    }): Promise<IPaymentProviderCreatePaymentUrlResponse>;
    
}

export const IPaymentService = Symbol("IPaymentService");