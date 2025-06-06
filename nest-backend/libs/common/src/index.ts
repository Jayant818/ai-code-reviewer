import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongoModule } from "libs/mongoDb/src";

@Module({
    imports: [
        ConfigModule,
        MongoModule
    ]
})
export class CommonModule{ }