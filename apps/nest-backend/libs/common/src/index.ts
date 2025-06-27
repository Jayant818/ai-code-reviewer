import { Module } from "@nestjs/common";
import { ConfigModule } from "@app/config";
import { MongoModule } from "libs/mongoDb/src";
import { RedisModule } from "@app/redis";

@Module({
    imports: [
        ConfigModule,
        MongoModule,
        RedisModule,
    ]
})
export class CommonModule{ }