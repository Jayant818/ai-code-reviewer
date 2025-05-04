import { Body, Post, Headers, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { GithubService } from './github.service';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { AppController } from 'lib/framework/src/decorators';

@AppController('github')
export class GithubController {
  constructor(
    private readonly githubService: GithubService,
    private readonly configService: ConfigService,
  ) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() body: any,
    @Headers('X-GitHub-Event') githubEvent: string,
    @Headers('X-Hub-Signature-256') signature: string,
  ) {
    console.log('Received GitHub webhook event:', githubEvent);

    //   Verify webhook signature
    const isValid = this.verifySignature(
      signature,
      JSON.stringify(body),
      this.configService.get('BUG_CHECKER_WEBHOOK_SECRET'),
    );

    if (!isValid) {
      return { message: 'Invalid signature' };
    }

    // Handling different github events
    switch (githubEvent) {
      case 'pull_request':
        return this.handlePullRequestEvent(body);
      case 'check_run':
        return this.handleCheckRunEvent(body);
      case 'check_suite':
        return this.handleCheckSuiteEvent(body);
      default:
        return { message: 'Unsupported event' };
    }
  }

  private async handlePullRequestEvent(payload: any) {
    const { action } = payload;

    // synchronize - when a pull request is updated
    if (
      action === 'opened' ||
      action === 'synchronize' ||
      action === 'reopened'
    ) {
      await this.githubService.reviewPullRequest(
        payload.repository.full_name,
        payload.pull_request.number,
        payload.installation.id,
        action,
      );

      return { message: 'PR review initiated' };
    }

    return { message: `PR ${action} event received` };
  }

  private async handleCheckRunEvent(payload: any) {
    if (payload.action === 'rerequested') {
      await this.githubService.handleCheckRunRerequest(payload);
      return { message: 'Check run re-requested' };
    }

    return { message: 'Check run event received' };
  }

  private async handleCheckSuiteEvent(payload: any) {
    if (payload.action === 'requested') {
      await this.githubService.handleCheckSuiteRequested(payload);
      return { message: 'Check suite requested' };
    }

    return { message: 'Check suite event received' };
  }

  private verifySignature(
    signature: string,
    payload: string,
    secret: string,
  ): boolean {
    if (!secret || !signature) {
      console.log('Missing secret or signature for verification');
      return false;
    }

    const hmac = crypto.createHmac('sha256', secret);

    // digest - output of hash function we can simply call it hash
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    console.log('digest', digest);
    console.log('signature', signature);

    // It compares two buffers in a way that is resistant to timing attacks.
    // Means it will take same time to compare two buffers regardless of their content.
    // useful when comparing API Keys | Password Hash etc,
    // It takes binary buffer as input and returns boolean value.
    // Buffer.from converts a string to a buffer.
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  }

  @Get('test')
  testRoute() {
    return { status: 'ok', message: 'GitHub controller is working' };
  }
}
