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
  // 1) Getting the octokit instance using GitHub App Authentication
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
    head_sha,
    pull_number,
  }: {
    file: any;
    octokit: Octokit;
    owner: string;
    repo: string;
    head_sha: string;
    pull_number: number;
  }) {
    // skip binary file
    if (file.status === 'removed' || file.binary) {
      return `### ${file.filename}\nFile was removed or is binary. Skipping review.`;
    }

    console.log('File to review:', file.filename);
    console.log('File sha:', file.sha);

    try {
      // get file content
      const { data: fileContent } = await octokit.repos.getContent({
        owner,
        repo,
        path: file.filename,
        ref: head_sha,
      });

      if (!fileContent || !('content' in fileContent)) {
        return `### ${file.filename}\nFile content is not available. Skipping review.`;
      }

      // we will get content in base64 encoded format lets decode it
      // base64 is used so that data don't lost while transferring it, as some characters aren't supported (binary data [images , PDF are typically binary data])
      // First we need to convert it into binary
      const code = Buffer.from(fileContent.content, 'base64').toString();

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

  private async createInlineComment({
    octokit,
    owner,
    repo,
    prNumber,
    reviewComments,
  }: {
    octokit: Octokit;
    owner: string;
    repo: string;
    prNumber: number;
    reviewComments: string[];
  }) {
    await octokit.pulls.createReview({
      owner,
      repo,
      pull_number: prNumber,
      body: reviewComments.join('\n\n'),
      event: 'COMMENT',
    });
  }

  // --------- Main Function ---------

  async reviewPullRequest(
    repoFullName: string,
    prNumber: number,
    installationId: number,
  ) {
    try {
      const octokit = await this.getOctoKit(installationId);

      const [owner, repo] = repoFullName.split('/');
      console.log('Owner:', owner);
      console.log('Repo:', repo);

      // Get PR Details to get the head SHA
      const prDetails = await this.getPullRequestDetails({
        octokit,
        owner,
        repo,
        prNumber,
      });

      // sha  - Commit ID , Its basically a hash
      const headSha = prDetails.head.sha;

      // when we create a PR or push a commit some checks need to be performed
      // Like Code Liniting  , Test Casees
      // Here we are adding our own check with status - "in_progress"
      // Create a check - for AI Review
      const check = await octokit.checks.create({
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

      // Getting all the files changes in the pr
      const files = await this.getPullRequestFiles({
        octokit,
        owner,
        repo,
        pull_number: prNumber,
      });
      // file.sha - hash used to uniquely identify the file, so it can compare 2 file
      // if the file contentes are same they will have the same file.sha
      const reviewPromise = files.map((file) =>
        this.reviewFile({
          file,
          octokit,
          owner,
          repo,
          // to get the file content we need the sha of the commit that we want to review
          head_sha: headSha,
          pull_number: prNumber,
        }),
      );

      const fileReview = await Promise.all(reviewPromise);

      // const combinedReview = this.combineReviews(fileReview);

      // console.log('Combined Review', combinedReview);

      const issueComment = fileReview.map((file) => {
        return octokit.issues.createComment({
          owner,
          repo,
          issue_number: prNumber, // PR numbers are the same as issue numbers in GitHub's API
          body: file,
        });
      });

      await Promise.all(issueComment);

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
    } catch (e: any) {
      console.log('Error in reviewing PR:', e.message);
    }
  }

  async handleCheckRunRerequest(payload: any): Promise<void> {
    const installationId = payload.installation.id;
    const checkRun = payload.check_run;
    const repository = payload.repository;

    if (checkRun.name === 'AI Code Review') {
      // Find the associated PR
      const octokit = await this.getOctoKit(installationId);
      const { data: pullRequests } = await octokit.pulls.list({
        owner: repository.owner.login,
        repo: repository.name,
        // Head branch is the branch where the check was run, It is our feature branch
        head: `${repository.owner.login}:${checkRun.check_suite.head_branch}`,
      });

      if (pullRequests.length > 0) {
        await this.reviewPullRequest(
          repository.full_name,
          pullRequests[0].number,
          installationId,
        );
      }
    }
  }

  async handleCheckSuiteRequested(payload: any): Promise<any> {
    const installationId = payload.installation.id;
    const repository = payload.repository;
    const checkSuite = payload.check_suite;

    // Find the PR
    const octokit = await this.getOctoKit(installationId);

    const { data: pullRequests } = await octokit.pulls.list({
      owner: repository.owner.login,
      repo: repository.name,
      head: `${repository.owner.login}:${checkSuite.head_branch}`,
    });

    if (pullRequests.length > 0) {
      await this.reviewPullRequest(
        repository.full_name,
        pullRequests[0].number,
        installationId,
      );
    }
  }
}
