import { RabbitMqConsumer, RabbitMqHandler } from "@app/framework";
import { RABBITMQ_QUEUES } from "@app/rabbitMq";
import { RK_FILE_REVIEW } from "./DTO/consumer/github-pull-request.dto";
import { ConfigService } from "@nestjs/config";
import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";
import { AIService } from "src/ai/ai.service";

@RabbitMqConsumer()
export class GithubFileConsumer{
    constructor(
        private readonly configService: ConfigService,
        private readonly aiService:AIService,
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
    }: {
        content: string;
        filename: string;
        owner: string;
        repo: string;
        headSha: string;
        installationId: number;
        }) {
        let octokit: Octokit;
        try {

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

            console.log("Reviews of one file", reviews);
            // return reviews;
          return;
            // we get the reviews
          } catch (e: any) {
            console.log('Error in reviewing file:', e.message);
            console.log('Stack trace:', e.stack);
            return [];
          }
    }
}