import { AppInjectable } from "@app/framework";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance, Method } from "axios";

@AppInjectable()
export class RazorPayBaseApi {
    protected readonly axiosInstance: AxiosInstance;

    constructor(
        protected readonly configService: ConfigService,
    ) {
        const RAZORPAY_KEY_ID = this.configService.get<string>('RAZORPAY_KEY_ID');
        const RAZORPAY_KEY_SECRET = this.configService.get<string>('RAZORPAY_KEY_SECRET');
        
        if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay credentials are not set in the environment variables');
        }

        const token = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

        this.axiosInstance = axios.create({
            baseURL: 'https://api.razorpay.com/v1',
            timeout: 5000,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${token}`
            }
        });
    }

    protected async request<T = any>({
        url,
        method = 'GET',
        data,
        params,
        headers,
    }: {
        url: string;
        method?: Method;
        data?: any;
        params?: Record<string, any>;
        headers?: Record<string, string>;
    }): Promise<T> {
        try {
            const response = await this.axiosInstance.request<T>({
                url,
                method,
                data,
                params,
                headers,
            });

            return response.data;
        } catch (error: any) {
            // Log and throw useful error
            const message = error?.response?.data?.error?.description || error.message || 'Razorpay API request failed';
            const status = error?.response?.status;
            
            throw new Error(`Razorpay Error [${status || 'Unknown'}]: ${message}`);
        }
    }
}
