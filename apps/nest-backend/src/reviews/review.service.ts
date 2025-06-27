import { AppInjectable } from "@app/framework";
import { MongooseConnection, MongooseTypes } from "@app/types";
import { ISSUE_SEVERITY, ISSUE_TYPE, REVIEW_STATUS } from "./models/review.model";
import { InjectConnection } from "@nestjs/mongoose";
import { ReviewsRepository } from "./review.repository";
import { PipelineStage } from "mongoose";
import { UnauthorizedException } from "@nestjs/common";

@AppInjectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    @InjectConnection() private readonly connection: MongooseConnection,
  ) { }
  

  async getReviewsAnalytics({
    orgId
  }: {
    orgId: MongooseTypes.ObjectId | null;
  }) {
    
    if (!orgId) {
      throw new UnauthorizedException("Organization Not Found");
    }
    
    const reviewPipeline: PipelineStage[] = [
      {
        $match: {
          orgId,
        }  
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          totalCritical: { $sum: "$issueCounts.critical" },
          totalHigh: { $sum: "$issueCounts.high" },
          totalMedium: { $sum: "$issueCounts.medium" },
          totalLow: { $sum: "$issueCounts.low" },
          totalInfo: { $sum: "$issueCounts.info" },
          totalComments: { $sum: "$commentsAdded" },
        }
      },
      {
        $project: {
          _id: 0,
          totalReviews: 1,
          totalBugs: {
            $sum: [
              "$totalCritical",
              "$totalHigh",
              "$totalMedium",
              "$totalLow",
              "$totalInfo"
            ]
          },
          totalComments: 1,
          breakdown: {
            critical: "$totalCritical",
            high: "$totalHigh",
            medium: "$totalMedium",
            low: "$totalLow",
            info: "$totalInfo",
          }
        }  
      }
    ]

    const result = await this.reviewsRepository.aggregate(reviewPipeline);

    if (result.length === 0) {
      return {
        totalReviews: 0,
        totalComments: 0,
        totalBugs: 0,
        breakdown: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          info: 0,
        }
      };
    }

    return result[0];
  }

  async completeReview(
    reviewId: MongooseTypes.ObjectId,
    data: {
      filesReviewed: number;
      commentsAdded: number;
      issues: Array<{
        message: string;
        severity: ISSUE_SEVERITY;
        type: ISSUE_TYPE;
        filename: string;
        lineNumber: number;
        columnNumber?: number;
        suggestion?: string;
      }>;
    }
  ) {
    // Calculate issue counts by severity
    const issueCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0
    };


    // Process issues to get counts
    data.issues.forEach(issue => {
      // Count by severity
      issueCounts[issue.severity]++;
      
      // Count by type
    //   issueTypeBreakdown[issue.type]++;
    });

    return this.reviewsRepository.completeReview(
      reviewId,
      {
        status: REVIEW_STATUS.COMPLETED,
        reviewCompletedAt: new Date(),
        filesReviewed: data.filesReviewed,
        commentsAdded: data.commentsAdded,
        issues: data.issues,
        issueCounts,
      }
    );
  }

  async getRecentReviews({
    orgId
  }: {
    orgId: MongooseTypes.ObjectId | null;
    }) {
    if (!orgId) {
      throw new UnauthorizedException("Organization Not Found");
    }
    
    const recentReviewPipeline: PipelineStage[] = [
      {
        $match: {
          orgId,
        }
      },
      {
        $sort: {
          createdAt:1,
        }
      },
      {
        $limit: 10
      },
      {
        $addFields: {
          totalIssue: {
            $sum: [
              "$issueCounts.critical",
              "$issueCounts.high",
              "$issueCounts.medium",
              "$issueCounts.low",
              "$issueCounts.info",
            ]
          }
        }
      },
      {
        $project: {
          repositoryName: 1,
          pullRequestTitle: 1,
          pullRequestUrl: 1,
          author: 1,
          reviewRequestedAt: 1,
          status: 1,
          aiProvider: 1,
          issueCounts:1,
        }
      },
    ]
    return await this.reviewsRepository.aggregate(recentReviewPipeline);
  }
}