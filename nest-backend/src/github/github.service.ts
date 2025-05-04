import { ConfigService } from '@nestjs/config';
import { AppInjectable } from 'lib/framework/src/decorators';
import { AIService } from 'src/ai/ai.service';
import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';

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
  private flag: boolean;
  constructor(
    private readonly configService: ConfigService,
    private readonly aiService: AIService,
  ) {
    this.flag = true;
  }

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

  private addLineNumbersToCode(code: string): string {
    const lines = code.split('\n');
    return lines.map((line, index) => `${index + 1}: ${line}`).join('\n');
  }

  private async reviewFile({
    content,
    filename,
  }: {
    content: string;
    filename: string;
  }) {
    try {
      // Skip files that don't need review
      if (
        filename.endsWith('.json') ||
        filename.endsWith('.lock') ||
        filename.endsWith('.yaml') ||
        filename.endsWith('.yml') ||
        filename.includes('package') ||
        filename.includes('tsconfig')
      ) {
        console.log(`Skipping review for ${filename} - configuration file`);
        return [];
      }

      console.log(`Reviewing file: ${filename}`);
      console.log(`Content patch: ${content.substring(0, 100)}...`);

      // Parse the patch to get the changed code
      if (!content || typeof content !== 'string') {
        console.log(`No patch content for ${filename}`);
        return [];
      }

      // Extract code from the patch
      const hunks = content.split('@@ ');
      if (hunks.length <= 1) {
        console.log(`No valid hunks found in patch for ${filename}`);
        return [];
      }

      const reviews = [];

      // Process each hunk (skipping the first element which is empty)
      for (let i = 1; i < hunks.length; i++) {
        const hunk = hunks[i];
        const hunkLines = hunk.split('\n');

        // First line contains the line numbers
        const lineInfo = hunkLines[0];
        const match = lineInfo.match(/\+(\d+),?(\d+)?/);

        if (!match) {
          console.log(`Could not parse line numbers from ${lineInfo}`);
          continue;
        }

        const startLine = parseInt(match[1], 10);
        const lineCount = match[2] ? parseInt(match[2], 10) : 1;
        const endLine = startLine + lineCount - 1;

        // Extract the added code (lines starting with +)
        let addedCode = '';
        for (let j = 1; j < hunkLines.length; j++) {
          const line = hunkLines[j];
          if (line.startsWith('+') && !line.startsWith('+++')) {
            addedCode += line.substring(1) + '\n';
          }
        }

        if (!addedCode.trim()) {
          console.log(`No added code found in hunk for ${filename}`);
          continue;
        }

        // Get AI review
        const { review } = await this.aiService.getPRReview({
          code: addedCode,
          provider: 'GEMINI',
        });

        console.log(
          `Received review: ${typeof review === 'string' ? review.substring(0, 100) : 'Not a string'}...`,
        );

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
        file.filename.endsWith('.png') ||
        file.filename.endsWith('.jpg') ||
        file.filename.endsWith('.jpeg') ||
        file.filename.endsWith('.gif') ||
        file.filename.endsWith('.svg') ||
        file.filename.endsWith('.ico') ||
        file.filename.endsWith('.webp') ||
        file.filename.endsWith('.json') ||
        file.filename.includes('lock') ||
        file.filename.includes('package')
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
    if (this.flag) {
      this.flag = false;
      console.log('fileContents', fileContents);
    }
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
    prNumber,
    commitId,
    path,
    body,
    position,
  }: {
    octokit: Octokit;
    owner: string;
    repo: string;
    prNumber: number;
    commitId: string;
    path: string;
    body: string;
    position: number;
  }) {
    await octokit.pulls.createReviewComment({
      owner,
      repo,
      pull_number: prNumber,
      body,
      commit_id: commitId,
      path,
      line: position,
    });
  }

  // --------- Main Function ---------

  async reviewPullRequest(
    repoFullName: string,
    prNumber: number,
    installationId: number,
    action: PULL_REQUEST_ACTIONS,
  ) {
    let octokit;
    let check;
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

      // Filter out null values from allFileContent
      // const validFileContents = allFileContent.filter((file) => file !== null);

      // if the PR is opened for 1st time then add a summary
      // if (action === PULL_REQUEST_ACTIONS.OPENED) {
      //   const summary = await this.getPRSummary({
      //     files: validFileContents,
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
        }),
      );

      const fileReview = await Promise.all(reviewPromise);

      // const combinedReview = this.combineReviews(fileReview);

      // console.log('Combined Review', combinedReview);
      console.log('File Review', fileReview);

      const issueComment = fileReview.flatMap((file) => {
        // // Check if file is an object with filename property
        // if (typeof file !== 'object' || file === null) {
        //   return [];
        // }

        if (!file) {
          return [];
        }

        // const fileName = file.filename || '';

        // let reviewArray = [];
        // try {
        //   // Handle different possible formats of the review data
        //   if (typeof file.review.review === 'string') {
        //     // Clean up the string by removing markdown code block markers and language identifier
        //     const cleanJson = file.review.review
        //       .replace(/```(json|javascript)\n?/g, '') // Remove ```json or ```javascript at the beginning
        //       .replace(/```\s*$/g, '') // Remove ``` at the end
        //       .trim(); // Remove any extra whitespace

        //     reviewArray = JSON.parse(cleanJson);
        //   } else if (Array.isArray(file.review.review)) {
        //     // If it's already an array, use it directly
        //     reviewArray = file.review.review;
        //   }
        // } catch (error) {
        //   console.error('Error parsing review JSON:', error);
        //   console.log('Raw review data:', file.review.review);
        //   return [];
        // }

        // if (!Array.isArray(reviewArray)) {
        //   console.error('Review data is not an array after parsing');
        //   return [];
        // }

        // console.log('Review Array', reviewArray);

        return file.map((review: any) => {
          console.log(review);
          const reviewData = JSON.parse(
            review.review
              .replace(/```(json|javascript)\n?/g, '') // Remove ```json or ```javascript at the beginning
              .replace(/```\s*$/g, '') // Remove ``` at the end
              .trim(),
          ); // Remove any extra whitespace

          console.log('ReviewData 2', reviewData);
          const remark = Array.isArray(reviewData)
            ? reviewData[0].body
            : reviewData.body;
          const improvedCode = Array.isArray(reviewData)
            ? reviewData[0].improvedCode
            : reviewData.improvedCode;
          console.log('remark', remark);

          const finalReview = `${remark}\n\n\`\`\`suggestion\n${improvedCode}\n\`\`\``;
          console.log('Body', finalReview);

          return octokit.pulls.createReviewComment({
            owner,
            repo,
            pull_number: prNumber,
            body: finalReview,
            commit_id: headSha,
            path: review.filename,
            line: review.endLine,
            start_side: 'RIGHT',
            // start_line: review.startLine,
            // start_line: review.startLine,
            // Remove end_line as it's not supported in this API
          });
        });
      });

      const data = await Promise.all(issueComment);
      console.log('Data', data);
      console.log('Comments Created');

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
    console.log("I'm running tooo");

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
    console.log("I'm running");
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
