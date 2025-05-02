import { ConfigService } from '@nestjs/config';
import { AppInjectable } from 'lib/framework/src/decorators';
import { AIService } from 'src/ai/ai.service';
import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';

@AppInjectable()
export class GithubService {
  constructor(
    private readonly configService: ConfigService,
    private readonly aiService: AIService,
  ) {}

  // Helper Functions
  private async getOctoKit(installationId: number) {
    const appId = this.configService.get('BUG_CHECKER_APP_ID');
    const privateKey = this.configService.get('BUG_CHECKER_CLIENT_SECRET');

    return new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId,
        privateKey,
        installationId,
      },
    });
  }

  async reviewPullRequest(
    repoFullName: string,
    prNumber: number,
    installationId: number,
  ) {
    try {
      const octokit = await this.getOctoKit(installationId);

      const [owner, repo] = repoFullName.split('/');

      // Creating a check run
      // Create a check run
      const check = await octokit.checks.create({
        owner,
        repo,
        name: 'AI Code Review',
        head_sha: (
          await this.getPullRequestDetails({ octokit, owner, repo, prNumber })
        ).head.sha,
        status: 'in_progress',
        output: {
          title: 'AI Code Review in Progress',
          summary: 'Analyzing code changes...',
        },
      });

      // Getting all the files
      const files = await this.getPullRequestFiles({
        octokit,
        owner,
        repo,
        pull_number: prNumber,
      });

      const reviewPromise = files.map((file) =>
        this.reviewFile({ file, octokit, owner, repo }),
      );

      const fileReview = await Promise.all(reviewPromise);

      const combinedReview = this.combineReviews(fileReview);

      await octokit.checks.update({
        owner,
        repo,
        check_run_id: check.data.id,
        status: 'completed',
        conclusion: 'success',
        output: {
          title: 'AI Code Review',
          summary: 'Review completed',
          text: combinedReview,
        },
      });
    } catch (e: any) {}
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
    pull_number,
  }: {
    octokit: Octokit;
    owner: string;
    repo: string;
    pull_number: number;
  }) {
    const { data } = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number,
    });

    return data;
  }

  private async reviewFile({
    file,
    octokit,
    owner,
    repo,
  }: {
    file: any;
    octokit: Octokit;
    owner: string;
    repo: string;
  }) {
    // skip binary file
    if (file.status === 'removed' || file.binary) {
      return `### ${file.filename}\nFile was removed or is binary. Skipping review.`;
    }

    try {
      // get file content
      const { data: fileContent } = await octokit.repos.getContent({
        owner,
        repo,
        path: file.filename,
        ref: file.sha,
      });

      if (!fileContent || !('content' in fileContent)) {
        return `### ${file.filename}\nFile content is not available. Skipping review.`;
      }

      // we will get content in base64 encoded format lets decode it
      let code = Buffer.from(fileContent.content, 'base64').toString();

      const review = await this.aiService.getAIReview({
        code,
        provider: 'GEMINI',
      });

      return `### ${file.filename}\n${review.review}`;
    } catch (e: any) {
      console.log('Error in reviewing file:', e.message);
      return `### ${file.filename}\nError in reviewing file: ${e.message}`;
    }
  }

  private combineReviews(fileReviews: string[]): string {
    return fileReviews.join('\n\n');
  }
}
