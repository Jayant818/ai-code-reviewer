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

enum PULL_REQUEST_ACTIONS {
  OPENED = 'opened',
  REOPENED = 'reopened',
  SYNCHRONIZE = 'synchronize',
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

  // Helper Functions
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

  private addLineNumbersToCode(code: string): string {
    const lines = code.split('\n');
    return lines.map((line, index) => `${index + 1}: ${line}`).join('\n');
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
    console.log('Called');
    try {
      // Skip files that don't need review
      if (!this.allowedFile(filename)) {
        console.log(`Skipping review for ${filename} - configuration file`);
        return [];
      }

      // Parse the patch to get the changed code
      if (!content || typeof content !== 'string') {
        console.log(`No patch content for ${filename}`);
        return [];
      }
      let fileContent = '';

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
        fileContent = Buffer.from(file.data.content, 'base64').toString();
      }

      // console.log('Content', content);
      // console.log('file content', fileContent);

      // Extract code from the patch
      const hunks = content.split('@@');
      if (hunks.length <= 1) {
        console.log(`No valid hunks found in patch for ${filename}`);
        return [];
      }

      // console.log('hunks', hunks);
      // console.log('hunksLength', hunks.length);

      const reviews = [];
      // let addedCode = '';

      // Process each hunk (skipping the first element which is empty)
      for (let i = 1; i < hunks.length; i += 2) {
        if (i + 1 >= hunks.length) {
          break;
        }

        // console.log('Hunk Set', hunks[i], 'and', hunks[i + 1]);
        // addedCode = '';
        const [startLine, endLine] = hunks[i].split('+')[1].split(',');

        const code = hunks[i + 1];

        // console.log('Code', code);

        // Get AI review
        if (!code) {
          // console.log(`No code found in hunk for ${filename}`);
          // console.log('Line ', hunks[i]);
          console.log('Hunk', hunks[i + 1]);
          continue;
        }
        const { review } = await this.aiService.getPRReview({
          code,
          provider: 'GEMINI',
          fileContent,
        });

        // console.log(
        //   `Received review: ${typeof review === 'string' ? review : 'Not a string'}...`,
        // );

        if (review) {
          reviews.push({
            filename,
            startLine,
            endLine,
            review,
          });
        }
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

  private async getAllFileContent({
    octokit,
    owner,
    repo,
    files,
    headSha,
  }: {
    octokit: Octokit;
    owner: string;
    repo: string;
    files: any[];
    headSha: string;
  }) {
    const fileContentPromises = files.map((file) => {
      // Skip binary files
      if (
        file.status === 'removed' ||
        file.binary ||
        !this.allowedFile(file.filename)
      ) {
        return Promise.resolve(null);
      }

      return octokit.repos.getContent({
        owner,
        repo,
        path: file.filename,
        ref: headSha,
      });
    });

    const fileContents = await Promise.all(fileContentPromises);

    // Convert it from base64 to string
    // we will get content in base64 encoded format lets decode it
    const decodedContents = fileContents.map((file) => {
      if (!file) return null;
      if (file.data && 'content' in file.data) {
        return {
          filename: file.data.path,
          content: Buffer.from(file.data.content, 'base64').toString(),
        };
      }
      return null;
    });

    return decodedContents;
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
    const org = await this.orgRepository.createOrganization({
      name: payload.installation.account.login,
      githubId: payload.installation.account.id,
      seatsLeft: 0,
    });

    await this.integrationRepository.createIntegration({
      installationId: payload.installation.id,
      orgId: org._id,
      integrationTypes: 'Github_APP',
      type: payload.installation.account.type,
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
    let octokit;
    let check;
    let reviewRecord;
    try {
      octokit = await this.getOctoKit(installationId);

      const [owner, repo] = repoFullName.split('/');

      // Get PR Details to get the head SHA
      const prDetails = await this.getPullRequestDetails({
        octokit,
        owner,
        repo,
        prNumber,
      });

      // sha  - Commit ID , Its basically a hash
      const headSha = prDetails.head.sha;

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

      // Getting all the files changes in the pr
      const files = await this.getPullRequestFiles({
        octokit,
        owner,
        repo,
        pull_number: prNumber,
      });

      console.log('Files', files);

      // file.sha - hash used to uniquely identify the file, so it can compare 2 file
      // if the file contentes are same they will have the same file.sha
      // const allFileContent = await this.getAllFileContent({
      //   octokit,
      //   owner,
      //   repo,
      //   files,
      //   // to get the file content we need the sha of the commit that we want to review
      //   headSha,
      // });

      // // Filtering null values of file
      // const filteredFileContent = allFileContent.filter(
      //   (file) => file !== null,
      // );

      // if the PR is opened for 1st time then add a summary
      // if (action === PULL_REQUEST_ACTIONS.OPENED) {
      //   const summary = await this.getPRSummary({
      //     files: filteredFileContent,
      //   });

      //   await this.createInlineComment({
      //     octokit,
      //     owner,
      //     repo,
      //     prNumber,
      //     reviewComment: summary,
      //   });
      // }
      // console.log('Files', files);

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

      const fileReview = await Promise.all(reviewPromise);

      const issueComment = fileReview.flatMap((file) => {
        if (!file) return [];

        return file.map(async (review: any) => {
          try {
            // First, clean up the review text by removing code fences
            const cleanedReview = review.review
              .replace(/```(?:javascript|json)?\n?/g, '') // remove starting code fences
              .replace(/```\s*$/g, ''); // remove ending code fences

            // Try to parse as JSON
            let reviewData;
            try {
              // Use a regex-based approach to extract body and improvedCode
              const bodyMatch = cleanedReview.match(/"body"\s*:\s*"([^"]+)"/);
              const codeMatch = cleanedReview.match(
                /"improvedCode"\s*:\s*"([^"]+)"/,
              );

              const body = bodyMatch
                ? bodyMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n')
                : 'Code review suggestion';
              const improvedCode = codeMatch
                ? codeMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n')
                : '';

              reviewData = { body, improvedCode };
            } catch (parseError) {
              console.error('Failed to parse review JSON:', parseError);

              // Fallback: Create a simple structure with the raw content
              reviewData = {
                body: 'Code review suggestion',
                improvedCode: cleanedReview,
              };
            }

            const remark = reviewData.body;
            const improvedCode = reviewData.improvedCode;

            const finalReview = `${remark}\n\n\`\`\`suggestion\n${improvedCode}\n\`\`\``;

            return this.createReviewComment({
              octokit,
              owner,
              repo,
              pull_number: prNumber,
              body: finalReview,
              commit_id: headSha,
              path: review.filename,
              line: Number(review.endLine.trim()),
              start_side: 'RIGHT',
              start_line: Number(review.startLine.trim()),
            });
          } catch (error) {
            console.error('Error processing review:', error);
            return Promise.resolve(); // Continue with other reviews
          }
        });
      });

      const data = await Promise.all(issueComment);

      console.log('Data', data);
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
