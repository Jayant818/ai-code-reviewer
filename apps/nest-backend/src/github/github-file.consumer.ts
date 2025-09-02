import { RabbitMqConsumer, RabbitMqHandler } from "@app/framework";
import { RABBITMQ_QUEUES, RabbitMqService } from "@app/rabbitMq";
import { RK_FILE_REVIEW, RK_GITHUB_COMMENT } from "./DTO/consumer/github-pull-request.dto";
import { ConfigService } from "@nestjs/config";
import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";
import { AIService } from "src/ai/ai.service";
import { TokenBucketService } from "src/tokenBucket/tokenBucket.service";

@RabbitMqConsumer()
export class GithubFileConsumer{
    constructor(
        private readonly configService: ConfigService,
        private readonly aiService: AIService,
        private readonly tokenBucketService: TokenBucketService,
        private readonly rabbitMqService: RabbitMqService,
    ) { }

    // Helper function 
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
    
    @RabbitMqHandler({
        queue: RABBITMQ_QUEUES.GITHUB.FILE_REVIEW_QUEUE,
        routingKey:RK_FILE_REVIEW
    })
    async handleFileReview({
        content,
        filename,
        owner,
        repo,
        headSha,
      installationId,
      prNumber,
      check,
      reviewRecordId,
      orgId
    }: {
        prNumber: number;
        check: string;
        reviewRecordId: string;
        orgId: string;
        content: string;
        filename: string;
        owner: string;
        repo: string;
        headSha: string;
        installationId: number;
        }) {
      let octokit: Octokit;
      console.log("Accessing File")
      try {
          
            const isAllowed = await this.tokenBucketService.isAllowed();
            if (!isAllowed) {
              this.rabbitMqService.publishMessage({
                message: {
                    content,
                    filename,
                    owner,
                    repo,
                    headSha,
                  installationId,
                  prNumber,
                  check,
                  reviewRecordId,
                  orgId
                },
                messageMeta: {
                  routingKey: RK_FILE_REVIEW,
                  messageId: `file-review-queue-${Date.now()}`,
                  maxRetries: 5,
                }
              });
              console.log('Rate limit exceeded, re-queuing the message');
              return;
            }

            octokit = await this.getOctoKit(installationId);

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
            //   await new Promise((r) => setTimeout(() => { r(null) }, 100));
            }
          
          this.rabbitMqService.publishMessage({
            message: {
              fileReview: reviews,
              installationId,
              headSha,
              owner,
              repo,
              prNumber,
              check,
              reviewRecordId,
              orgId
            },
            messageMeta: {
              routingKey: RK_GITHUB_COMMENT,
              messageId: `file-comment-queue-${Date.now()}`,
              maxRetries: 5,
            }
          });
          } catch (e: any) {
            console.log('Error in reviewing file:', e.message);
            console.log('Stack trace:', e.stack);
            return [];
          }
    }
}