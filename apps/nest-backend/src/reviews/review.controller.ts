import { AppController } from "@app/framework";
import { Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import { User } from "src/user/model/user.model";
import { MongooseTypes } from "@app/types";
import { ReviewsService } from "./review.service";

@AppController('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('analytics')
  async getReviewsAnalytics(@Req() req) {
    const result =  await this.reviewsService.getReviewsAnalytics({
      orgId: req.user.orgId ?  new MongooseTypes.ObjectId(req.user.orgId) : null,
    });
    
    return result;
  }

  @Get('recent')
  async getRecentReview(@Req() req) { 
    const result = await this.reviewsService.getRecentReviews({
      orgId: req.user.orgId ?  new MongooseTypes.ObjectId(req.user.orgId): null,
    })

    return result;
  }
}