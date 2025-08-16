import { AppController } from "@app/framework";
import { IntegrationService } from "./Integration.service";
import { Get, Post, Req, Res } from "@nestjs/common";
import { MongooseTypes } from "@app/types";
import { SlackService } from "./Slack/slack.service";

@AppController("/integration")
export class IntegrationController{
    constructor(
        private readonly integrationService: IntegrationService,
        private readonly slackService: SlackService,
    ){}
    @Get()
    async getIntegration(@Req() req) {
        const orgId = req.user.orgId ? new MongooseTypes.ObjectId(req.user.orgId) : null;

        return this.integrationService.getIntegrationDetails({
            orgId
        })
    }

    @Get("slack/connect")
    async ConnectToSlack(@Req() req, @Res() res) {        
        const url = await this.slackService.ConnectToSlack(req.user.id);
        
        return res.redirect(url);
    }


}