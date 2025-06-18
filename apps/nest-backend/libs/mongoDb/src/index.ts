import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import {MongooseModule} from "@nestjs/mongoose";

@Module({
    imports: [
        MongooseModule.forRootAsync({
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('MONGODB_URI'),
                dbName: configService.get<string>('DB_NAME'),
                user: configService.get<string>('DB_USER'),
                pass: configService.get<string>('DB_PASS'),
                authSource: 'admin',
                autoIndex: !0,
            }),
            inject:[ConfigService],

        })
    ]
})
export class MongoModule{}