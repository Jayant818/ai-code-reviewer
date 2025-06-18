import { RabbitMqConsumer, RabbitMqHandler } from '@app/framework';
import { RABBITMQ_QUEUES } from '@app/rabbitMq';
import { RK_GITHUB_PR } from './DTO/consumer/github-pull-request.dto';

@RabbitMqConsumer()
export class GithubConsumer {
  constructor() {}

  @RabbitMqHandler({
    queue: RABBITMQ_QUEUES.GITHUB.PULL_REQUEST_QUEUE,
    routingKey: RK_GITHUB_PR,
  })
  async handlePRReview(payload: any) {
    console.log('Doing PR Review');
    console.log('Payload', payload);
  }
}
