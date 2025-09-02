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

  private addLineNumbersToCode(code: string, startLine: number, endLine: number): string {
    const lines = code.split("\n");
    let currentLine = startLine;
    const numberedLines: string[] = [];
  
    for (const line of lines) {
      if (line.startsWith("-")) {
        // Deleted line → keep without number
        numberedLines.push(`    ${line}`);
      } else {
        // Added or unchanged line → add number
        if (currentLine <= endLine) {
          numberedLines.push(`${String(currentLine).padStart(4)} ${line}`);
          currentLine++;
        } else {
          // If somehow we exceed endLine, just push line without number
          numberedLines.push(`    ${line}`);
        }
      }
    }
  
    return numberedLines.join("\n");
  }

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

   private async createReviewComment({
    octokit,
    owner,
    repo,
    pull_number,
    body,
    commit_id,
    path,
    line,
    start_line,
    start_side,
  }: {
    octokit: Octokit;
    owner: string;
    repo: string;
    pull_number: number;
    body: string;
    commit_id: string;
    path: string;
    line: number;
    start_line: number;
    start_side: 'RIGHT' | 'LEFT';
  }) {
    console.log('Data', {
      owner,
      repo,
      pull_number,
      body,
      commit_id,
      path,
      line,
      start_line,
      start_side,
    });
    await octokit.pulls.createReviewComment({
      owner,
      repo,
      pull_number,
      body,
      commit_id,
      path,
      line,
      side: 'RIGHT',
      start_line,
      start_side,
    });
  }

   private async reviewFile({
      content,
      filename,
      octokit,
      repo,
      owner,
      headSha,
    }: {
      content: string;
      filename: string;
      octokit: Octokit;
      repo: string;
      owner: string;
      headSha: string;
    }) {
      try {
        let fileContentWithAllChanges = '';
  
        // Make a api call to get the fulll file Data
        const file = await octokit.repos.getContent({
          owner,
          repo,
          path: filename,
          ref: headSha,
        });
  
        if (!file || !file.data || !('content' in file.data)) {
          console.log(`No file content for ${filename}`);
        }
  
        // Decode the file content from base64
        if (file.data && 'content' in file.data) {
          fileContentWithAllChanges = Buffer.from(file.data.content, 'base64').toString();
        }
  
        // Extract code from the patch
        const hunks = content.split('@@');
  
        if (hunks.length <= 1) {
          console.log(`No valid hunks found in patch for ${filename}`);
          return [];
        }
  
        const reviews = [];
  
        // Process each hunk (skipping the first element which is empty)
        for (let i = 1; i < hunks.length; i += 2) {
          // From i we get the hunk line and from i + 1 we get the code
          if (i + 1 >= hunks.length) {
            break;
          }
  
          const [startLine, spanLine] = hunks[i].split('+')[1].split(',');
          const endLine = (parseInt(startLine, 10) + parseInt(spanLine, 10) - 1).toString();
  
          const code = this.addLineNumbersToCode(hunks[i + 1], parseInt(startLine, 10), parseInt(endLine, 10));
  
          // Get AI review
          if (!code) {
            console.log('Hunk', hunks[i + 1]);
            continue;
          }
  
          const { review } = await this.aiService.getPRReview({
            code,
            provider: 'GEMINI',
            fileContent: fileContentWithAllChanges,
          });
  
          if (review) {
            reviews.push({
              filename,
              startLine,
              endLine,
              review,
            });
          }
          await new Promise((r) => setTimeout(() => { r(null) }, 100));
        }
        return reviews;
      } catch (e: any) {
        console.log('Error in reviewing file:', e.message);
        console.log('Stack trace:', e.stack);
        return [];
      }
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
      reviewRecord: {
        _id: any;
        status: string;
        reviewCompletedAt?: Date;
      };
    }) {
    console.log('Received PR payload:', { prNumber, owner, repo, files: files.length });
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
              reviewRequestedAt:new Date(),
       });
      
       const files = await this.getPullRequestFiles({
        octokit,
        owner,
        repo,
        base_sha: baseSha,
        head_sha: headSha,
      });
      
      
      const reviewPromise = files.map((file) =>
      
        this.reviewFile({
          content: file.patch,
          filename: file.filename,
          octokit,
          owner,
          repo,
          headSha,
        }),
      );

      this.rabbitMqService.publishMessage({
        message: {
          
        },
        messageMeta: {
          maxRetries: 4,
          messageId: `file-review-${Date.now()}`,
          routingKey: RK_FILE_REVIEW,
        }
      })

      const fileReviews = await Promise.all(reviewPromise);

      

       // Use flatMap to flatten and filter out empty arrays
      const flattenedReviews = fileReviews.flatMap((reviews) => reviews || []);

      console.log('File Review', flattenedReviews[0].review);

      const issueComment = flattenedReviews.map((file) => {
        return file.review.map(async (review: ReviewSuggestion) => {
          console.log('Review', review);
          try {            
            if ((review?.startLine >= file.startLine) && review?.endLine <= file.endLine && review?.startLine <= file.endLine && review?.endLine >= file.startLine) { 
              const remark = review.body;
              const improvedCode = review.improvedCode;
  
              const finalReview = `${remark}\n\n\`\`\`suggestion\n${improvedCode}\n\`\`\``;
  
              return this.createReviewComment({
                octokit,
                owner,
                repo,
                pull_number: prNumber,
                body: finalReview,
                commit_id: headSha,
                path: file.filename,
                line: review.endLine,
                start_side: 'RIGHT',
                start_line: review.startLine,
              });
            }

          } catch (error) {
            console.error('Error processing review:', error);
            return Promise.resolve(); // Continue with other reviews
          }
        });
      });

        for (let i = 0; i < issueComment.length; i += GITHUB_BATCH_SIZE) {
              await Promise.all(issueComment.slice(i, i + GITHUB_BATCH_SIZE));
        }
      
        await octokit.checks.update({
        owner,
        repo,
        check_run_id: check.data.id,
        status: 'completed',
        conclusion: 'success',
        output: {
          title: 'AI Code Review',
          summary: 'Review completed',
        },
      });
      
       await this.reviewRepository.updateReview({
              filter: {
                _id: reviewRecord._id
              },
              update: {
                status: REVIEW_STATUS.COMPLETED,
                reviewCompletedAt: new Date(),
              } 
            })
      
            await this.organizationRepository.updateOrganization({
              filter: {
                _id: new MongooseTypes.ObjectId(orgId),
              },
              update: {
                $inc: {
                  reviewsLeft: -1,
                }
              }
            })
      
            await this.organizationRepository.updateOrganization({
              filter: {
                _id: new MongooseTypes.ObjectId(orgId),
              },
              update: {
                $inc: {
                  reviewsLeft: -1,
                }
              }
            })
      

    }
    catch (error) {
      console.error('Error handling PR review:', error);
      return;
    }
  }
}
