import { AppInjectable } from "@app/framework";
import { MongooseTypes } from "@app/types";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cache } from "cache-manager";
import * as crypto from "crypto";

@AppInjectable()
export class SlackService{
    constructor(
        private readonly configService: ConfigService,
        @Inject(CACHE_MANAGER) 
        private readonly cacheManager:Cache,
    ) {       }

    async ConnectToSlack(userId: MongooseTypes.ObjectId) {
        try {
            const state = crypto.randomBytes(10).toString("hex");
            
            // TODO: Create a Helper Function, also can store that in a map.
            // await this.cacheManager.set(`slackToken-${userId.toString()}`, state);

    
            const redirectUri = this.configService.get<string>('SLACK_REDIRECT_URI');
            const encodedUri = encodeURIComponent(redirectUri);
            const SlackClientId = this.configService.get<string>('SLACK_CLIENT_ID');
    
    
            const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${SlackClientId}&scope=chat:write,users:read&state=${state}&userId=${userId.toString()}&redirect_uri=${encodedUri}`;
            return slackAuthUrl;
        } catch (error) { 
            console.error("Error in ConnectToSlack:", error);
            throw new Error("Failed to connect to Slack");
        }
    }
}