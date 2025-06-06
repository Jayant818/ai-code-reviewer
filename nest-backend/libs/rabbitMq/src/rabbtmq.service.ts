import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { IAmqpConnectionManager } from 'amqp-connection-manager/dist/types/AmqpConnectionManager';
import {
  RABBITMQ_CONSUMER,
  RABBITMQ_HANDLER,
  RABBITMQ_ROUTER,
} from './constants/metaData';
import { COMMON_EXCHANGE, COMMON_EXCHANGE_DLX } from './constants';
import {
  IRabbitHandlerInstance,
  IRabbitRouter,
  ISendMsgToDLQ,
  RmqProducerType,
} from './types';
import { IRabbitMqHandler } from '@app/framework';

@Injectable()
export class RabbitMqService
  implements OnModuleInit, OnModuleDestroy, OnApplicationBootstrap
{
  private amqpConnection: IAmqpConnectionManager;

  private amqpChannel: ChannelWrapper;

  // this will contains a mapping of queue to the handlers
  private rabbitRouter: IRabbitRouter;

  constructor(
    private readonly configService: ConfigService,
    private readonly discoveryService: DiscoveryService,
  ) {
    // If no url, it will try to connect to the default RabbitMQ URL, which is typically amqp://localhost
    this.amqpConnection = amqp.connect([
      this.configService.get('RABBITMQ_URL'),
    ]);

    this.amqpChannel = this.amqpConnection.createChannel({
      // The library will automatically serialize and deserialize JSON messages
      json: true,
    });
  }

  private getDeadLetterQueueName(queue: string): string {
    return `${queue}.dlq`;
  }

  private fetchQueuesAndHandlers(): IRabbitRouter {
    // Its main job is to find out where we have defined the rabbitmq decorator
    // 1. Getting all the consumers - a consumer contains 2 things, 1st - the instance of the controller, 2nd - the metatype of the controller[the class iteself, this is useful to get the metsData]
    const rabbitConsumers = this.discoveryService
      .getControllers()
      .filter((controller) => {
        return (
          controller.metatype &&
          //  In this we need to tell the target, the target is obviously the class itself, we get that by controller.mettype.
          Reflect.getMetadata(RABBITMQ_CONSUMER.identifier, controller.metatype)
        );
      });

    // It is a Nest JS Utility class provided by NestJS to scan metadata of classes and their methods.
    const metadataScanner = new MetadataScanner();

    const router: IRabbitRouter = {};

    // To check for each function ki kis pe @RabbitHandler laga hua hai we have to get acccess to the methods they have

    for (const consumer of rabbitConsumers) {
      // 2. Getting all the methods of the consumer
      // Getting the instance - It will be an object
      const controllerInstance = consumer.instance;
      // Getting the prototype object of the class. In this we get the methods of the class
      // we need methods of the class,
      //  we get a object (as prototype is a object) that contains all the methods of the class
      const controllerPrototype = Object.getPrototypeOf(controllerInstance);
      // we get a array of methods
      const methods = metadataScanner.getAllMethodNames(controllerPrototype);

      const methodsWithRabbitHandler = methods.filter(
        (method) =>
          Reflect.getMetadata(
            RABBITMQ_HANDLER.identifier,
            controllerPrototype[method],
          ) === RABBITMQ_HANDLER,
      );

      methodsWithRabbitHandler.forEach((methodName) => {
        // isme metaData hoga , queue and routing key
        const msgRouter = Reflect.getMetadata(
          RABBITMQ_ROUTER,
          controllerPrototype[methodName],
        ) as IRabbitMqHandler;

        const routeDetails = {
          // Pura controller ka instance
          controllerInstance,
          controllerPrototype,
          handlerIdentifier: `${consumer.name}-${methodName}`,
          methodName,
          routingKey: msgRouter.routingKey,
        } as IRabbitHandlerInstance;

        if (!router[msgRouter.queue]) {
          router[msgRouter.queue] = [routeDetails];
          return;
        }

        if (
          router[msgRouter.queue].some(
            (handler) => handler.routingKey === routeDetails.routingKey,
          )
        ) {
          throw new Error(
            `Routing key ${msgRouter.routingKey} already exists for queue ${msgRouter.queue}`,
          );
        }

        router[msgRouter.queue].push(routeDetails);

        return;
      });
      return router;
    }
  }

  private async setupExchanges(): Promise<void> {
    const mainExchange = this.amqpChannel.assertExchange(
      COMMON_EXCHANGE.name,
      COMMON_EXCHANGE.type,
      COMMON_EXCHANGE.options,
    );

    const dlxExchange = this.amqpChannel.assertExchange(
      COMMON_EXCHANGE_DLX.name,
      COMMON_EXCHANGE_DLX.type,
      COMMON_EXCHANGE_DLX.options,
    );

    await Promise.all([mainExchange, dlxExchange]);
  }

  private async setupQueues(): Promise<void> {
    const queuePromises = Object.keys(this.rabbitRouter).map(async (queue) => {
      // Create a Main Queue

      const mainQueue = this.amqpChannel.assertQueue(queue, {
        durable: true,
        // rejected msg goes to this Dead letter exchange
        deadLetterExchange: COMMON_EXCHANGE_DLX.name,
      });

      // Create a DLX Queue
      const deadLetterQueueName = this.getDeadLetterQueueName(queue);
      const deadLetterQueue = this.amqpChannel.assertQueue(
        deadLetterQueueName,
        {
          durable: true,
        },
      );

      await Promise.all([mainQueue, deadLetterQueue]);

      // Creating binding b/w DLE & DLQ
      // The routing key for the DLQ is the name of the DLQ itself
      // It make sure that messages from DLX are routed to correct DLQ when we pass queuename as routingKey.

      await this.amqpChannel.bindQueue(
        deadLetterQueueName,
        COMMON_EXCHANGE_DLX.name,
        deadLetterQueueName,
      );

      // we get the all the handlers of the currrent queue
      // a handler contains the routingKey , method Name etc.
      const currentQueueHandlers = this.rabbitRouter[queue];

      // Creating Binding for each handler
      const bindingPromise = currentQueueHandlers.map((handler) => {
        return this.amqpChannel.bindQueue(
          queue,
          COMMON_EXCHANGE.name,
          handler.routingKey,
        );
      });

      await Promise.all(bindingPromise);
    });

    await Promise.all(queuePromises);
  }

  private sendMsgToDLQ({ message, queue, deliveryCount }: ISendMsgToDLQ) {
    const { content } = message;

    const options = {
      headers: {
        ...message.properties.headers,
        'delivery-count': deliveryCount,
        'x-death': {
          reason: 'max-retries-exceeded',
          time: new Date().toISOString(),
        },
      },
      messageId: message.fields.messageId,
      timeout: 3000, // 3 seconds
    };

    this.amqpChannel.publish(
      COMMON_EXCHANGE_DLX.name,
      this.getDeadLetterQueueName(queue),
      JSON.parse(content.toString()),
      options,
    );

    this.amqpChannel.ack(message);
    return;
  }

  private sendMsgForRetry({ message, queue, deliveryCount }: ISendMsgToDLQ) {
    const { content } = message;

    const options = {
      headers: {
        ...message.properties.headers,
        'delivery-count': deliveryCount,
        'original-routing-key': message.fields.routingKey,
      },
      messageId: message.fields.messageId,
      timeout: 3000, // 3 seconds
    };

    this.amqpChannel.sendToQueue(
      queue,
      JSON.parse(content.toString()),
      options,
    );
    this.amqpChannel.ack(message);
    return;
  }

  private setupConsumers(handlers: IRabbitRouter) {
    // Mapping over all the queues
    Object.keys(handlers).map((queue) => {
      this.amqpChannel.consume(queue, async (message) => {
        const { content } = message;
        const maxRetries = message.properties.headers['max-retries'];
        const deliveryCount = message.properties.headers['delivery-count'] + 1;

        try {
          const queueHandlers = handlers[queue];

          const routingKey =
            message.properties.headers['original-routing-key'] ||
            message.fields.routingKey;

          // Find the correct handler
          const handler = queueHandlers.find(
            (handler) => handler.routingKey === routingKey,
          );

          // running that particular handler
          await handler.controllerInstance[handler.methodName](
            JSON.parse(content.toString()),
          );

          this.amqpChannel.ack(message);
        } catch (e: any) {
          if (deliveryCount >= maxRetries) {
            this.sendMsgToDLQ({ message, queue, deliveryCount });
          } else {
            this.sendMsgForRetry({ message, queue, deliveryCount });
          }
        }
      });
    });
  }

  async onModuleInit() {
    //  All the modules have resolved and initialized.
    this.rabbitRouter = this.fetchQueuesAndHandlers();
    await this.setupExchanges();
    await this.setupQueues();
  }

  async onModuleDestroy() {
    await this.amqpChannel.close();
  }

  onApplicationBootstrap() {
    this.setupConsumers(this.rabbitRouter);
  }

  public publishMessage<T>({ message, messageMeta }: RmqProducerType<T>) {
    const options = {
      headers: {
        'delivery-count': 0,
        'max-retries': messageMeta.maxRetries,
      },
      messageId: messageMeta.messageId,
      timeout: 3000, // 3sec
    };

    return this.amqpChannel.publish(
      COMMON_EXCHANGE.name,
      messageMeta.routingKey,
      message,
      options,
    );
  }
}
