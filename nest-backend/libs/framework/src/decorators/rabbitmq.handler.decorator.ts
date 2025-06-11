import {
  RABBITMQ_HANDLER,
  RABBITMQ_ROUTER,
} from '@app/rabbitMq/src/constants/metaData';

export type IRabbitMqHandler = {
  queue: string;
  routingKey: string;
};

// What it should have
// Tell that this method is a rabbitmq handler
// Attach the queue and routing key to the method
export const RabbitMqHandler = ({
  queue,
  routingKey,
}: IRabbitMqHandler): MethodDecorator => {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    Reflect.defineMetadata(
      RABBITMQ_HANDLER.identifier,
      RABBITMQ_HANDLER.value,
      descriptor.value,
    );

    Reflect.defineMetadata(
      RABBITMQ_ROUTER,
      { queue, routingKey },
      descriptor.value,
    );
  };
};
