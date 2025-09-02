import { ConfigService } from '@nestjs/config';
import { AIService } from 'src/ai/ai.service';
import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import { AppInjectable } from '@app/framework';
import { InstallationEventDTO, Installations } from './DTO/InstallationEvent.dto';
import { IntegrationRepository } from 'src/Integrations/Integration.repository';
import { UserRepository } from 'src/user/user.repository';
import { IntegrationService } from 'src/Integrations/Integration.service';
import { Integration_Types } from 'src/Integrations/model/app-installation.model';
import { Inject } from '@nestjs/common';
import { IOrganizationRepository } from 'src/organization/interfaces/organization-repository.interface';
import { RabbitMqService } from '@app/rabbitMq';
import { RK_GITHUB_PR } from './DTO/consumer/github-pull-request.dto';

enum PULL_REQUEST_ACTIONS {
  OPENED = 'opened',
  REOPENED = 'reopened',
  SYNCHRONIZE = 'synchronize',
}

export interface ReviewSuggestion {
  body: string;
  improvedCode: string;
  startLine: number;
  endLine:number;
}

export interface File {
  filename: string;
  content: string;
}

@AppInjectable()
export class GithubService {
  constructor(
    @Inject(IOrganizationRepository)
    private readonly organizationRepository: IOrganizationRepository,
    private readonly configService: ConfigService,
    private readonly aiService: AIService,
    private readonly integrationRepository: IntegrationRepository,
    private readonly userRepository: UserRepository,
    private readonly integrationService: IntegrationService,
    private readonly rabbitMqService:RabbitMqService

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
    let org = await this.organizationRepository.findOne({
      filter: {
        githubId: payload.installation.account.id,
      },        
    })
    if (!org) {
      org = await this.organizationRepository.createOrganization({
        name: payload.installation.account.login,
        githubId: payload.installation.account.id,
        seatsLeft: 0,
      });
    }

    await this.integrationRepository.createIntegration({
      installationId: payload.installation.id,
      orgId: org._id,
      integrationTypes: Integration_Types.GITHUB_APP,
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
    console.log("Review PR Called");

    let octokit : Octokit;

    octokit = await this.getOctoKit(installationId);

    const [owner, repo] = repoFullName.split('/');


    // Get User Org Subscription
    const orgId = await this.integrationService.getOrgIdFromInstallationId(installationId);

    const Subscription = await this.organizationRepository.findOne({
      filter: {
        _id: orgId,
      },
      select: ['reviewsLeft'],
    });

    if (!Subscription || Subscription.reviewsLeft <= 0) {
      console.log('No reviews left for this organization');
      this.createInlineComment({
        octokit,
        owner,
        repo,
        prNumber,
        reviewComment: 'You have no reviews left. Please upgrade your plan by visiting our website.'
      })
      return;
    }

    try {
      console.log("Fetching PR Details");
     
      this.rabbitMqService.publishMessage({
        message: {
          installationId,
          owner,
          repo,
          prNumber,
          userOrgId: orgId,
          repoFullName,
        },
        messageMeta: {
          routingKey: RK_GITHUB_PR,
          messageId: `review-pr-${Date.now()}`,
          maxRetries:5
        }
      })

    } catch (e: any) {
      console.log('Error in reviewing PR:', e);
      // if (octokit && check) {
      //   await octokit.checks.update({
      //     owner: repoFullName.split('/')[0],
      //     repo: repoFullName.split('/')[1],
      //     check_run_id: check.data.id,
      //     status: 'completed',
      //     conclusion: 'failure',
      //     output: {
      //       title: 'AI Code Review',
      //       summary: `Error in review: ${e.message}`,
      //     },
      //   });
      // }
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
