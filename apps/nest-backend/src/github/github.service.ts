import { ConfigService } from '@nestjs/config';
import { AIService } from 'src/ai/ai.service';
import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import { AppInjectable } from '@app/framework';
import { InstallationEventDTO, Installations } from './DTO/InstallationEvent.dto';
import { IntegrationRepository } from 'src/Integrations/Integration.repository';
import { OrganizationRepository } from 'src/organization/organization.repository';
import { UserRepository } from 'src/user/user.repository';
import { ReviewsService } from 'src/reviews/review.service';
import { ReviewsRepository } from 'src/reviews/review.repository';
import { LLM } from 'src/organization/Model/organization.model';
import { IntegrationService } from 'src/Integrations/Integration.service';
import { REVIEW_STATUS } from 'src/reviews/models/review.model';
import { GITHUB_BATCH_SIZE } from 'src/common/constants';

enum PULL_REQUEST_ACTIONS {
  OPENED = 'opened',
  REOPENED = 'reopened',
  SYNCHRONIZE = 'synchronize',
}

interface ReviewSuggestion {
  body: string;
  improvedCode: string;
  startLine: number;
  endLine:number;
}

interface File {
  filename: string;
  content: string;
}

@AppInjectable()
export class GithubService {
  constructor(
    private readonly configService: ConfigService,
    private readonly aiService: AIService,
    private readonly integrationRepository: IntegrationRepository,
    private readonly orgRepository: OrganizationRepository,
    private readonly userRepository: UserRepository,
    private readonly reviewsRepository: ReviewsRepository,
    private readonly integrationService: IntegrationService,

  ) {}

  //  -------Helper Functions Start-------------------

  // Getting the octokit instance using GitHub App Authentication
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

  private combineReviews(fileReviews: string[]): string {
    return fileReviews.join('\n\n');
  }

  private async createInlineComment({
    octokit,
    owner,
    repo,
    prNumber,
    reviewComment,
  }: {
    octokit: Octokit;
    owner: string;
    repo: string;
    prNumber: number;
    reviewComment: string[] | string;
  }) {
    await octokit.pulls.createReview({
      owner,
      repo,
      pull_number: prNumber,
      body: Array.isArray(reviewComment)
        ? reviewComment.join('\n\n')
        : reviewComment,
      event: 'COMMENT',
    });
  }

  private async getPRSummary({ files }: { files: File[] }) {
    const { summary } = await this.aiService.getAISummary({
      files,
      provider: 'GEMINI',
    });

    return summary;
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

  // --------- Main Function ---------

  async createIntegration(payload: InstallationEventDTO) {
    let org = await this.orgRepository.findOne({
      filter: {
        githubId: payload.installation.account.id,
      },        
    })
    if (!org) {
      org = await this.orgRepository.createOrganization({
        name: payload.installation.account.login,
        githubId: payload.installation.account.id,
        seatsLeft: 0,
      });
    }

    await this.integrationRepository.createIntegration({
      installationId: payload.installation.id,
      orgId: org._id,
      integrationTypes: 'Github_APP',
      integratedBy: payload.installation.account.id,
    });
  
    const user = await this.userRepository.findOne({
      filter: {
        githubId: payload.installation.account.id,
      }
    })

    if (!user) {
      await this.userRepository.createUser({
        githubId: payload.installation.account.id,
        username: payload.installation.account.login,
        email: "",
        avatar: payload.installation.account.avatar_url,
        orgId: org._id,
      })
    } else {
      await this.userRepository.update(
        {
          filter: {
            githubId: payload.installation.account.id,
          },
          update: {
            orgId: org._id,
          }
        }
      )
    }

    return org._id;
  }

  async reviewPullRequest(
    repoFullName: string,
    prNumber: number,
    installationId: number,
    action: PULL_REQUEST_ACTIONS,
  ) {
    let octokit : Octokit;
    let check : any;
    let reviewRecord : any;
    try {
      const [owner, repo] = repoFullName.split('/');

      octokit = await this.getOctoKit(installationId);


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


      reviewRecord = await this.reviewsRepository.createReview({
        orgId: await this.integrationService.getOrgIdFromInstallationId(installationId),
        repositoryName: repoFullName,
        pullRequestNumber: prNumber,
        pullRequestTitle: prDetails.title,
        pullRequestUrl: prDetails.html_url,
        commitSha: headSha,
        author: prDetails.user.login,
        aiProvider: LLM.GEMINI, // Default provider, could be made configurable,
        reviewRequestedAt:new Date(),
      });

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

      // Getting changed details in patch
      const files = await this.getPullRequestFiles({
        octokit,
        owner,
        repo,
        base_sha: baseSha,
        head_sha: headSha,
      });

      // if the PR is opened for 1st time then add a summary
      // if (action === PULL_REQUEST_ACTIONS.OPENED) {
      //   const summary = await this.getPRSummary({
      //     files: filteredFiles,
      //   });

      //   await this.createInlineComment({
      //     octokit,
      //     owner,
      //     repo,
      //     prNumber,
      //     reviewComment: summary,
      //   });
      // }

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

      await this.reviewsRepository.updateReview({
        filter: {
          _id: reviewRecord._id
        },
        update: {
          status: REVIEW_STATUS.COMPLETED,
          reviewCompletedAt: new Date(),
        } 
      })

    } catch (e: any) {
      console.log('Error in reviewing PR:', e);
      if (octokit && check) {
        await octokit.checks.update({
          owner: repoFullName.split('/')[0],
          repo: repoFullName.split('/')[1],
          check_run_id: check.data.id,
          status: 'completed',
          conclusion: 'failure',
          output: {
            title: 'AI Code Review',
            summary: `Error in review: ${e.message}`,
          },
        });
      }
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
          PULL_REQUEST_ACTIONS.SYNCHRONIZE,
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
        PULL_REQUEST_ACTIONS.SYNCHRONIZE,
      );
    }
  }
}
