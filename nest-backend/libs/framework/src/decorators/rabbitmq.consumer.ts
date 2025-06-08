import { applyDecorators, Controller, SetMetadata } from '@nestjs/common';
import { RABBITMQ_CONSUMER } from '@app/rabbitMq/src/constants/metaData';

export const RabbitMqConsumer = () => {
  // Here we are attaching meta Data to the controller
  return applyDecorators(
    Controller(),
    SetMetadata(RABBITMQ_CONSUMER.identifier, RABBITMQ_CONSUMER.value),
  );
};
