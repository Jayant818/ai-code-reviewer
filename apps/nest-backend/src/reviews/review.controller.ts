import { AppController } from "@app/framework";
import { Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import { User } from "src/user/model/user.model";
import { MongooseTypes } from "@app/types";
import { ReviewsService } from "./review.service";

@AppController('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('recent')
  async getRecentReviews(
    @Req() req,
    @Query('limit') limit: number = 10
  ) {
    return this.reviewsService.getRecentReviews(
      req.iser.orgId,
      limit
    );
  }

  // @Get('stats')
  // async getReviewStats(
  //   @Req() req,
  // ) {
  //   return this.reviewsService.getReviewStats(
  //     req.user.orgId,

  //   );
  // }
}