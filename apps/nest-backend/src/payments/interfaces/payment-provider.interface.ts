export interface IPaymentProviderCreatePaymentUrlParams { 
    amount: number;
    currency: "IND";

}

export interface IPaymentProviderCreatePaymentUrlResponse{
    url: string;
    transactionId:string
}

export interface IPaymentProvider {
    createPaymentUrl(params:IPaymentProviderCreatePaymentUrlParams):Promise<IPaymentProviderCreatePaymentUrlResponse>
}