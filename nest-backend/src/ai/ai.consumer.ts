import { RabbitMqConsumer, RabbitMqHandler } from '@app/framework';
import { RABBITMQ_QUEUES } from '@app/rabbitMq';
import { RK_AI_PR_SUMMARY } from './DTO/consumer/ai-code-summary.dto';
import { RK_AI_PR_REVIEW } from './DTO/consumer/ai-code-review.dto';

@RabbitMqConsumer()
export class AIConsumer {
  constructor() {}

  @RabbitMqHandler({
    queue: RABBITMQ_QUEUES.AI.MAIN_QUEUE,
    routingKey: RK_AI_PR_REVIEW,
  })
  async handlePRReview(payload: any) {
    console.log('Doing PR Review');
    console.log('Payload', payload);
  }

  @RabbitMqHandler({
    queue: RABBITMQ_QUEUES.AI.MAIN_QUEUE,
    routingKey: RK_AI_PR_SUMMARY,
  })
  async handleSummary(payload: any) {
    console.log('Doing Summary');
    console.log('Payload', payload);
  }
}
