import { AppInjectable } from "@app/framework";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { Cache } from "cache-manager";

@AppInjectable()
export class TokenBucketService{
    private readonly BucketSize = 15;
    // considering refillrate is in seconds
    private readonly RefillRate = 15 / 60; 
    private readonly BUCKET_KEY = 'token-bucket';
    
    constructor(
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache
    ) { }

    onModuleInit() { 
        this.cacheManager.set(`token-bucket`, JSON.stringify({
            tokens: this.BucketSize,
            lastRefill: Date.now()
        }));
    }

    async currentTokens() {
        const bucket = await this.getTokenBucket();
        const now = Date.now();
        const elapsedTime = (now - bucket.lastRefill) / 1000; // convert ms to seconds
        const newTokens = Math.floor(elapsedTime * this.RefillRate);

        if (newTokens > 0) {
            bucket.tokens = Math.min(this.BucketSize, bucket.tokens + newTokens);
            bucket.lastRefill = now;
        }
        await this.saveTokenBucket(bucket);
        return {...bucket,tokens:bucket.tokens};
    }

    async processRequest() {
        const bucket = await this.currentTokens();
        return bucket.tokens > 0;
    }


    async isAllowed(): Promise<boolean> {
        const bucket = await this.currentTokens();
        if (bucket.tokens > 0) {
            bucket.tokens -= 1;
            await this.saveTokenBucket(bucket);
            return true;
        }

        await this.saveTokenBucket(bucket);
        return false;

    }

    async getTokenBucket() {
        const bucket = await this.cacheManager.get(this.BUCKET_KEY);
        if (bucket) {
            return JSON.parse(bucket as string);
        }

        return {
            tokens: this.BucketSize,
            lastRefill: Date.now()
        }
    }

    async saveTokenBucket(bucket: { tokens: number; lastRefill: number }) { 
        this.cacheManager.set(this.BUCKET_KEY, JSON.stringify(bucket));
    }
    

}