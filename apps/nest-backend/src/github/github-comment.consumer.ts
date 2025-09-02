import { RabbitMqConsumer, RabbitMqHandler } from "@app/framework";
import { RABBITMQ_QUEUES } from "@app/rabbitMq";
import { RK_GITHUB_COMMENT } from "./DTO/consumer/github-pull-request.dto";
import { ReviewSuggestion } from "./github.service";
import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";
import { MongooseTypes } from "@app/types";
import { ConfigService } from "@nestjs/config";
import { ReviewsRepository } from "src/reviews/review.repository";
import { REVIEW_STATUS } from "src/reviews/models/review.model";
import { IOrganizationRepository } from "src/organization/interfaces/organization-repository.interface";
import { Inject } from "@nestjs/common";

@RabbitMqConsumer()
export class GithubCommentConsumer{
    private buffer: string[] = [];
    private bufferLimit = 10
    constructor(
        private readonly configService: ConfigService,
        private readonly reviewRepository: ReviewsRepository,
        @Inject(IOrganizationRepository)
        private readonly organizationRepository: IOrganizationRepository,
    ) { }

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

    // We get reviews of a file
    @RabbitMqHandler({
        queue: RABBITMQ_QUEUES.GITHUB.COMMENT_QUEUE,
        routingKey: RK_GITHUB_COMMENT
    })
    async handleGithubComment({ fileReview, installationId, headSha, owner, repo, prNumber, check, reviewRecordId, orgId }) {
        try {

          const octokit = await this.getOctoKit(installationId);
          
          fileReview.forEach((fileReview: { filename: string; startLine: number; endLine: number; review: ReviewSuggestion[] }) => { 
            const reviews = fileReview.review;
            reviews.forEach(async (review: ReviewSuggestion) => { 
              try {
                if ((review?.startLine >= fileReview.startLine) && review?.endLine <= fileReview.endLine && review?.startLine <= fileReview.endLine && review?.endLine >= fileReview.startLine) {
                  const remark = review.body;
                  const improvedCode = review.improvedCode;
      
                  const finalReview = `${remark}\n\n\`\`\`suggestion\n${improvedCode}\n\`\`\``;
      
                  await this.createReviewComment({
                      octokit,
                      owner,
                      repo,
                      pull_number: prNumber,
                      body: finalReview,
                      commit_id: headSha,
                      path: fileReview.filename,
                      line: review.endLine,
                      start_side: 'RIGHT',
                      start_line: review.startLine,
                  });
              }
              } catch (error) {
                console.error('Error creating review comment:', error);
                
              }
            })
          })

  
        // fileReview.forEach(async (review: ReviewSuggestion) => {
        //         console.log('Review', review);
        //     try {
        //         if ((review?.startLine >= fileReview.startLine) && review?.endLine <= fileReview.endLine && review?.startLine <= fileReview.endLine && review?.endLine >= fileReview.startLine) {
        //             const remark = review.body;
        //             const improvedCode = review.improvedCode;
        
        //             const finalReview = `${remark}\n\n\`\`\`suggestion\n${improvedCode}\n\`\`\``;
        
        //             await this.createReviewComment({
        //                 octokit,
        //                 owner,
        //                 repo,
        //                 pull_number: prNumber,
        //                 body: finalReview,
        //                 commit_id: headSha,
        //                 path: fileReview.filename,
        //                 line: review.endLine,
        //                 start_side: 'RIGHT',
        //                 start_line: review.startLine,
        //             });
        //         }
      
        //     } catch (error) {
        //         console.error('Error creating review comment:', error);
        //     }

        // });
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
            _id: new MongooseTypes.ObjectId(reviewRecordId),
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
    }catch(error) {
        console.error('Error handling file comment:', error);
        return;
    }

    }
}