import { RabbitMqConsumer, RabbitMqHandler } from "@app/framework";
import { RABBITMQ_QUEUES } from "@app/rabbitMq";
import { RK_FILE_REVIEW } from "./DTO/consumer/github-pull-request.dto";

@RabbitMqConsumer()
export class GithubFileConsumer{
    constructor() { }
    
    @RabbitMqHandler({
        queue: RABBITMQ_QUEUES.GITHUB.FILE_REVIEW_QUEUE,
        routingKey:RK_FILE_REVIEW
    })
    async handleFileReview({

    }: {}) {
        
    }
}