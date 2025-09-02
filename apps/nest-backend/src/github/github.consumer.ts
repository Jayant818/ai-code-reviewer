import { RabbitMqConsumer, RabbitMqHandler } from '@app/framework';
import { RABBITMQ_QUEUES, RabbitMqService } from '@app/rabbitMq';
import { RK_FILE_REVIEW, RK_GITHUB_PR } from './DTO/consumer/github-pull-request.dto';
import { Octokit } from '@octokit/rest';
import { AIService } from 'src/ai/ai.service';
import { GITHUB_BATCH_SIZE } from 'src/common/constants';
import { ReviewSuggestion } from './github.service';
import { IOrganizationRepository } from 'src/organization/interfaces/organization-repository.interface';
import { Inject } from '@nestjs/common';
import { REVIEW_STATUS } from 'src/reviews/models/review.model';
import { MongooseTypes } from '@app/types';
import { ReviewsRepository } from 'src/reviews/review.repository';
import { ConfigService } from '@nestjs/config';
import { createAppAuth } from '@octokit/auth-app';
import { Channel } from 'amqp-connection-manager';
import { LLM } from 'src/organization/Model/organization.model';

@RabbitMqConsumer()
export class GithubConsumer {
  constructor(private readonly aiService: AIService,
    @Inject(IOrganizationRepository)
    private readonly organizationRepository: IOrganizationRepository,
    private readonly reviewRepository: ReviewsRepository,
    private readonly configService: ConfigService,
    private readonly rabbitMqService: RabbitMqService,
    private readonly reviewsRepository:ReviewsRepository,
  ) {}

  // HELPER METHODS

    private async getPullRequestDetails({
    octokit,
    owner,
    repo,
    prNumber,
  }: {
    octokit: Octokit;
    owner: string;
    repo: string;
    prNumber: number;
  }) {
    const { data } = await octokit.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });

    return data;
    }
  
    private allowedFile(filename: string) {
      return (
        !filename.endsWith('.png') &&
        !filename.endsWith('.jpg') &&
        !filename.endsWith('.jpeg') &&
        !filename.endsWith('.gif') &&
        !filename.endsWith('.svg') &&
        !filename.endsWith('.ico') &&
        !filename.endsWith('.webp') &&
        !filename.endsWith('.json') &&
        !filename.endsWith('.lock') &&
        !filename.endsWith('.yaml') &&
        !filename.endsWith('.yml') &&
        !filename.includes('package') &&
        !filename.includes('tsconfig')
      );
    }
  
  private async getPullRequestFiles({
      octokit,
      owner,
      repo,
      base_sha,
      head_sha,
    }: {
      octokit: Octokit;
      owner: string;
      repo: string;
      base_sha: string;
      head_sha: string;
    }) {
      const comparison = await octokit.repos.compareCommits({
        owner,
        repo,
        base: base_sha,
        head: head_sha,
      });
  
      const files = comparison.data.files.filter(
        (file) => file !== null && file.status !== 'removed' && this.allowedFile(file.filename),
      );
  
      return files;
    }
  
   private async getOctoKit(installationId: number) {
      const appId = this.configService.get('BUG_CHECKER_APP_ID');
  
      const privateKey = this.configService.get('BUG_CHECKER_PVT_KEY');
  
      return new Octokit({
        authStrategy: createAppAuth,
        auth: {
          appId,
          privateKey,
          installationId,
        },
      });
    }

  // ========== RABBITMQ HANDLERS =============

  @RabbitMqHandler({
    queue: RABBITMQ_QUEUES.GITHUB.PULL_REQUEST_QUEUE,
    routingKey: RK_GITHUB_PR,
  })
  async handlePRReview({
    installationId,
    owner,
    repo,
    prNumber,
    userOrgId,
    repoFullName,
  }: {
      installationId: number;
      owner: string;
      repoFullName: string;
      repo: string;
      prNumber: number;
      userOrgId: string;
    }) {
    console.log('Received PR payload:', { prNumber, owner, repo });
    let octokit: Octokit;
    let orgId = new MongooseTypes.ObjectId(userOrgId);
    let check: any;
    let reviewRecord : any;

    try {

      octokit = await this.getOctoKit(installationId);

      const [owner, repo] = repoFullName.split('/');

       // Get PR Details to get the head SHA
        // file.sha - hash used to uniquely identify the file, so it can compare 2 file
      // if the file contentes are same they will have the same file.sha
        // to get the file content we need the sha of the commit that we want to review
      const prDetails = await this.getPullRequestDetails({
        octokit,
        owner,
        repo,
        prNumber,
      });

      // sha  - Commit ID , Its basically a hash
      const headSha = prDetails.head.sha;
      const baseSha = prDetails.base.sha;

      // when we create a PR or push a commit some checks need to be performed
      // Like Code Liniting  , Test Casees
      // Here we are adding our own check with status - "in_progress"
      // Create a check - for AI Review
      check = await octokit.checks.create({
        owner,
        repo,
        name: 'AI Code Review',
        head_sha: headSha,
        status: 'in_progress',
        output: {
          title: 'AI Code Review in Progress',
          summary: 'Analyzing code changes...',
        },
      });

       reviewRecord = await this.reviewsRepository.createReview({
            orgId,
            repositoryName: repoFullName,
            pullRequestNumber: prNumber,
            pullRequestTitle: prDetails.title,
            pullRequestUrl: prDetails.html_url,
            commitSha: headSha,
            author: prDetails.user.login,
            aiProvider: LLM.GEMINI, // Default provider, could be made configurable,
            reviewRequestedAt: new Date(),
            status: REVIEW_STATUS.PENDING,
            filesReviewed: 0,
            totalFiles: prDetails.changed_files,
       });
      
       const files = await this.getPullRequestFiles({
        octokit,
        owner,
        repo,
        base_sha: baseSha,
         head_sha: headSha,
      });

      console.log("Calling File Queue");
      for (let i = 0; i < files.length; i++) {
        this.rabbitMqService.publishMessage({
          message: {
            content: files[i].patch,
            filename:files[i].filename,
            owner,
            repo,
            headSha,
            installationId,
            prNumber,
            check,
            reviewRecordId: reviewRecord._id,
            orgId
          },
          messageMeta: {
            maxRetries: 4,
            messageId: `file-review-${Date.now()}`,
            routingKey: RK_FILE_REVIEW,
          }
        }) 
      }

    }
    catch (error) {
      console.error('Error handling PR review:', error);
      return;
    }
  }
}
