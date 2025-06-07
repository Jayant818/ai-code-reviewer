import { Module } from "@nestjs/common";
import { ConfigModule } from "@app/config";
import { MongoModule } from "libs/mongoDb/src";

@Module({
    imports: [
        ConfigModule,
        MongoModule
    ]
})
export class CommonModule{ }