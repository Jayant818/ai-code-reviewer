import { AppInjectable } from "@app/framework";
import { MongooseModel, MongooseTypes } from "@app/types";
import { InjectModel } from "@nestjs/mongoose";
import { COLLECTION_NAMES } from "src/common/constants";
import { Review, ReviewDocument, REVIEW_STATUS } from "./models/review.model";
import { ClientSession, Mongoose, PipelineStage } from "mongoose";

@AppInjectable()
export class ReviewsRepository {
  constructor(
    @InjectModel(COLLECTION_NAMES.Reviews.Review)
    private readonly reviewModel: MongooseModel<ReviewDocument>
  ) { }
  
  async aggregate(pipeline: PipelineStage[]) { 
    return this.reviewModel.aggregate(pipeline);
  }

  async createReview(data: Partial<Review>, session?: ClientSession): Promise<ReviewDocument> {
    const review = new this.reviewModel(data);
    return review.save({ session });
  }

  async updateReview<k extends keyof Review>({
    filter,
    update,
    session,
  }: {
    filter: Partial<Record<k, Review[k]>>;
    update: Partial<Review>;
    session?: ClientSession;
  }) {
    const query = this.reviewModel.findOneAndUpdate(filter, { $set: update }, { new: true });

    if (session) {
      query.session(session);
    }

    return query.lean<Review>().exec();
  }

  async findById(id: MongooseTypes.ObjectId, session?: ClientSession): Promise<ReviewDocument | null> {
    return this.reviewModel.findById(id).session(session || null).exec();
  }

  async findByPullRequest(
    orgId: MongooseTypes.ObjectId,
    repositoryName: string,
    pullRequestNumber: number,
    session?: ClientSession
  ): Promise<ReviewDocument | null> {
    return this.reviewModel
      .findOne({
        orgId,
        repositoryName,
        pullRequestNumber
      })
      .session(session || null)
      .exec();
  }

  async completeReview(
    id: MongooseTypes.ObjectId,
    updateData: {
      status: REVIEW_STATUS.COMPLETED;
      reviewCompletedAt: Date;
      filesReviewed: number;
      commentsAdded: number;
      issues: Array<any>;
      issueCounts: Record<string, number>;
    },
    session?: ClientSession
  ): Promise<ReviewDocument | null> {
    return this.reviewModel
      .findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      )
      .session(session || null)
      .exec();
  }

    async getReviewStats({
        orgId,
        limit,
        session,
    }: {
        orgId: MongooseTypes.ObjectId,
        limit: number,
        session?: ClientSession
    }) {
        const reviewPipeline: PipelineStage[] = [
            {
                $match: {
                    orgId,
                    status: REVIEW_STATUS.COMPLETED,
                }
            },
            {
                $sort: {
                    createdAt:-1
                }
            },
            {
                $limit:limit,
            },
            {
                $project: {
                    _id: 1,
                    repositoryName: 1,
                    pullRequestNumber: 1,
                    pullRequestTitle: 1,
                    author: 1,
                    aiProvider: 1,
                    commentsAdded: 1,
                    issueCounts: 1,
                    totalIssues: {
                        $sum: {
                            $add: [
                                "$issueCounts.critical",
                                "$issueCounts.high",
                                "$issueCounts.medium",
                                "$issueCounts.low",
                                "$issueCounts.info"
                            ]
                        }
                    }
                }    
            }
        ]    
        
        return this.reviewModel.aggregate(reviewPipeline).session(session || null).exec();  
    }
}