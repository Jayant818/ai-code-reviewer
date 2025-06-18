import { AppInjectable } from "@app/framework";
import { MongooseConnection, MongooseTypes } from "@app/types";
import { ISSUE_SEVERITY, ISSUE_TYPE, REVIEW_STATUS } from "./models/review.model";
import { InjectConnection } from "@nestjs/mongoose";
import { ReviewsRepository } from "./review.repository";

@AppInjectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    @InjectConnection() private readonly connection: MongooseConnection,
  ) {}



  async startReview(reviewId: MongooseTypes.ObjectId) {
    return this.reviewsRepository.updateReviewStatus(
      reviewId,
      REVIEW_STATUS.IN_PROGRESS
    );
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

  async markReviewFailed(reviewId: MongooseTypes.ObjectId) {
    return this.reviewsRepository.updateReviewStatus(
      reviewId,
      REVIEW_STATUS.FAILED
    );
  }

  async getRecentReviews(orgId: MongooseTypes.ObjectId, limit: number = 10) {
    return this.reviewsRepository.getRecentReviews(orgId, limit);
  }
}