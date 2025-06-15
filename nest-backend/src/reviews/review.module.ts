import { Module } from '@nestjs/common';
import { ReviewsRepository } from './review.repository';
import { COLLECTION_NAMES } from 'src/common/constants';
import { ReviewSchema } from './models/review.model';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewsController } from './review.controller';
import { ReviewsService } from './review.service';


const reviewModels = [
  {
    name: COLLECTION_NAMES.Reviews.Review,
    schema: ReviewSchema,
  }
]

@Module({
  imports: [
    MongooseModule.forFeature(reviewModels),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService,ReviewsRepository],
  exports: [ReviewsService,ReviewsRepository],
})
export class ReviewModule {}
