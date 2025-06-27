import { Global, Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { ConfigService } from "@nestjs/config";
import { createKeyv } from "@keyv/redis";

/*
use - @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
*/


/*
CacheModule doesn;t expose any class to inject, but instead register their provider under some token name.
*/
@Global()
@Module({
    imports: [
        CacheModule.registerAsync({
            useFactory: (ConfigService: ConfigService) => ({
                stores: [
                    createKeyv({
                        url: ConfigService.get<string>('REDIS_URL'),
                        username: ConfigService.get<string>('REDIS_USERNAME'),
                        password: ConfigService.get<string>('REDIS_PASSWORD'),
                    })
                ],
                ttl: ConfigService.get<number>('CACHE_TTL', 60 * 60 * 1000),
            }),
            isGlobal: true,
            inject:[ConfigService]
        })
    ]
})
export class RedisModule{
}