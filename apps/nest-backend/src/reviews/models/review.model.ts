import { MongooseDocument, MongooseTypes } from "@app/types";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { COLLECTION_NAMES } from "src/common/constants";
import { ILLM, LLM_VALUES } from "src/organization/Model/organization.model";

export enum REVIEW_STATUS {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum ISSUE_SEVERITY {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

export enum ISSUE_TYPE {
  BUG = 'bug',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  STYLE = 'style',
  BEST_PRACTICE = 'best_practice'
}


@Schema({
  timestamps: true,
  collection: COLLECTION_NAMES.Reviews.Review
})
export class Review {
  _id: MongooseTypes.ObjectId;

  @Prop({
    type: MongooseTypes.ObjectId,
    ref: COLLECTION_NAMES.Organization.organization,
    required: true,
    index: true
  })
  orgId: MongooseTypes.ObjectId;

  @Prop({ required: true })
  repositoryName: string;

  @Prop({ required: true })
  pullRequestNumber: number;

  @Prop({ required: true })
  pullRequestTitle: string;

  @Prop({ required: true })
  pullRequestUrl: string;

  @Prop({ required: true })
  commitSha: string;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true })
  reviewRequestedAt: Date;

  @Prop({ required: false })
  reviewCompletedAt?: Date;

  @Prop({
    required: true,
    enum: Object.values(REVIEW_STATUS),
    default: REVIEW_STATUS.PENDING
  })
  status: REVIEW_STATUS;

  @Prop({
    required: true,
    type: String,
    enum: LLM_VALUES
  })
  aiProvider: ILLM;

  @Prop({ required: false, default: 0 })
  filesReviewed: number;

  @Prop({ required: false, default: 0 })
  commentsAdded: number;

  @Prop({
    type: {
      critical: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
      info: { type: Number, default: 0 }
    },
    default: { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
  })
  issueCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };


  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
export type ReviewDocument = Review & MongooseDocument;

ReviewSchema.index({ orgId: 1, createdAt: -1 });
ReviewSchema.index({ orgId: 1, repositoryName: 1, createdAt: -1 });
ReviewSchema.index({ orgId: 1, status: 1 });
ReviewSchema.index({ pullRequestUrl: 1 }, { unique: true });