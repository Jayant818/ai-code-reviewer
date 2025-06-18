import { Global, Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";

@Global()
@Module({
    imports: [
        NestConfigModule.forRoot({
            cache: true,
            isGlobal: true,
        })
    ]
})
export class ConfigModule{ }