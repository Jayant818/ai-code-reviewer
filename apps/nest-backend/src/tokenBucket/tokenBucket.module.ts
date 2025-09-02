import { Module } from "@nestjs/common";
import { TokenBucketService } from "./tokenBucket.service";

@Module({
    providers: [TokenBucketService],
    exports: [TokenBucketService],
})
export class TokenBucketModule{
    constructor(){}
}