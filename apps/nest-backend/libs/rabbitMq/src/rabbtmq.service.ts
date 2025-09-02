// import {
//   Injectable,
//   OnApplicationBootstrap,
//   OnModuleDestroy,
//   OnModuleInit,
// } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { DiscoveryService, MetadataScanner } from '@nestjs/core';
// import amqp, { ChannelWrapper } from 'amqp-connection-manager';
// import { IAmqpConnectionManager } from 'amqp-connection-manager/dist/types/AmqpConnectionManager';
// import {
//   RABBITMQ_CONSUMER,
//   RABBITMQ_HANDLER,
//   RABBITMQ_ROUTER,
// } from './constants/metaData';
// import { COMMON_EXCHANGE, COMMON_EXCHANGE_DLX } from './constants';
// import {
//   IRabbitHandlerInstance,
//   IRabbitRouter,
//   ISendMsgToDLQ,
//   RmqProducerType,
// } from './types';
// import { IRabbitMqHandler } from '@app/framework';

// @Injectable()
// export class RabbitMqService
//   implements OnModuleInit, OnModuleDestroy, OnApplicationBootstrap
// {
//   private amqpConnection: IAmqpConnectionManager;

//   private amqpChannel: ChannelWrapper;

//   // this will contains a mapping of queue to the handlers
//   private rabbitRouter: IRabbitRouter;

//   constructor(
//     private readonly configService: ConfigService,
//     private readonly discoveryService: DiscoveryService,
//   ) {
//     // If no url, it will try to connect to the default RabbitMQ URL, which is typically amqp://localhost
//     this.amqpConnection = amqp.connect([
//       this.configService.get('RABBITMQ_URL'),
//     ]);

//     this.amqpChannel = this.amqpConnection.createChannel({
//       // The library will automatically serialize and deserialize JSON messages
//       json: true,
//     });
//   }

//   private getDeadLetterQueueName(queue: string): string {
//     return `${queue}.dlq`;
//   }

//   private fetchQueuesAndHandlers(): IRabbitRouter {
//     // Its main job is to find out where we have defined the rabbitmq decorator
//     // 1. Getting all the consumers - a consumer contains 2 things, 1st - the instance of the controller, 2nd - the metatype of the controller[the class iteself, this is useful to get the metsData]
//     const rabbitConsumers = this.discoveryService
//       .getControllers()
//       .filter((controller) => {
//         return (
//           controller.metatype &&
//           //  In this we need to tell the target, the target is obviously the class itself, we get that by controller.mettype.
//           Reflect.getMetadata(RABBITMQ_CONSUMER.identifier, controller.metatype)
//         );
//       });

//     // It is a Nest JS Utility class provided by NestJS to scan metadata of classes and their methods.
//     const metadataScanner = new MetadataScanner();

//     const router: IRabbitRouter = {};

//     // To check for each function ki kis pe @RabbitHandler laga hua hai we have to get acccess to the methods they have

//     for (const consumer of rabbitConsumers) {
//       // 2. Getting all the methods of the consumer
//       // Getting the instance - It will be an object
//       const controllerInstance = consumer.instance;
//       // Getting the prototype object of the class. In this we get the methods of the class
//       // we need methods of the class,
//       //  we get a object (as prototype is a object) that contains all the methods of the class
//       const controllerPrototype = Object.getPrototypeOf(controllerInstance);
//       // we get a array of methods
//       const methods = metadataScanner.getAllMethodNames(controllerPrototype);

//       const methodsWithRabbitHandler = methods.filter(
//         (method) =>
//           Reflect.getMetadata(
//             RABBITMQ_HANDLER.identifier,
//             controllerPrototype[method],
//           ) === RABBITMQ_HANDLER,
//       );

//       methodsWithRabbitHandler.forEach((methodName) => {
//         // isme metaData hoga , queue and routing key
//         const msgRouter = Reflect.getMetadata(
//           RABBITMQ_ROUTER,
//           controllerPrototype[methodName],
//         ) as IRabbitMqHandler;

//         const routeDetails = {
//           // Pura controller ka instance
//           controllerInstance,
//           controllerPrototype,
//           handlerIdentifier: `${consumer.name}-${methodName}`,
//           methodName,
//           routingKey: msgRouter.routingKey,
//         } as IRabbitHandlerInstance;

//         if (!router[msgRouter.queue]) {
//           router[msgRouter.queue] = [routeDetails];
//           return;
//         }

//         if (
//           router[msgRouter.queue].some(
//             (handler) => handler.routingKey === routeDetails.routingKey,
//           )
//         ) {
//           throw new Error(
//             `Routing key ${msgRouter.routingKey} already exists for queue ${msgRouter.queue}`,
//           );
//         }

//         router[msgRouter.queue].push(routeDetails);

//         return;
//       });
//     }
//     return router;

//   }

//   private async setupExchanges(): Promise<void> {
//     const mainExchange = this.amqpChannel.assertExchange(
//       COMMON_EXCHANGE.name,
//       COMMON_EXCHANGE.type,
//       COMMON_EXCHANGE.options,
//     );

//     const dlxExchange = this.amqpChannel.assertExchange(
//       COMMON_EXCHANGE_DLX.name,
//       COMMON_EXCHANGE_DLX.type,
//       COMMON_EXCHANGE_DLX.options,
//     );

//     await Promise.all([mainExchange, dlxExchange]);
//   }

//   private async setupQueues(): Promise<void> {
//     const queuePromises = Object.keys(this.rabbitRouter).map(async (queue) => {
//       // Create a Main Queue

//       const mainQueue = this.amqpChannel.assertQueue(queue, {
//         durable: true,
//         // rejected msg goes to this Dead letter exchange
//         deadLetterExchange: COMMON_EXCHANGE_DLX.name,
//       });

//       // Create a DLX Queue
//       const deadLetterQueueName = this.getDeadLetterQueueName(queue);
//       const deadLetterQueue = this.amqpChannel.assertQueue(
//         deadLetterQueueName,
//         {
//           durable: true,
//         },
//       );

//       await Promise.all([mainQueue, deadLetterQueue]);

//       // Creating binding b/w DLE & DLQ
//       // The routing key for the DLQ is the name of the DLQ itself
//       // It make sure that messages from DLX are routed to correct DLQ when we pass queuename as routingKey.

//       await this.amqpChannel.bindQueue(
//         deadLetterQueueName,
//         COMMON_EXCHANGE_DLX.name,
//         deadLetterQueueName,
//       );

//       // we get the all the handlers of the currrent queue
//       // a handler contains the routingKey , method Name etc.
//       const currentQueueHandlers = this.rabbitRouter[queue];

//       // Creating Binding for each handler
//       const bindingPromise = currentQueueHandlers.map((handler) => {
//         return this.amqpChannel.bindQueue(
//           queue,
//           COMMON_EXCHANGE.name,
//           handler.routingKey,
//         );
//       });

//       await Promise.all(bindingPromise);
//     });

//     await Promise.all(queuePromises);
//   }

//   private sendMsgToDLQ({ message, queue, deliveryCount }: ISendMsgToDLQ) {
//     const { content } = message;

//     const options = {
//       headers: {
//         ...message.properties.headers,
//         'delivery-count': deliveryCount,
//         'x-death': {
//           reason: 'max-retries-exceeded',
//           time: new Date().toISOString(),
//         },
//       },
//       messageId: message.fields.messageId,
//       timeout: 3000, // 3 seconds
//     };

//     this.amqpChannel.publish(
//       COMMON_EXCHANGE_DLX.name,
//       this.getDeadLetterQueueName(queue),
//       JSON.parse(content.toString()),
//       options,
//     );

//     this.amqpChannel.ack(message);
//     return;
//   }

//   private sendMsgForRetry({ message, queue, deliveryCount }: ISendMsgToDLQ) {
//     const { content } = message;

//     const options = {
//       headers: {
//         ...message.properties.headers,
//         'delivery-count': deliveryCount,
//         'original-routing-key': message.fields.routingKey,
//       },
//       messageId: message.fields.messageId,
//       timeout: 3000, // 3 seconds
//     };

//     this.amqpChannel.sendToQueue(
//       queue,
//       JSON.parse(content.toString()),
//       options,
//     );
//     this.amqpChannel.ack(message);
//     return;
//   }

//   private setupConsumers(handlers: IRabbitRouter) {
//     // Mapping over all the queues
//     Object.keys(handlers).map((queue) => {
//       this.amqpChannel.consume(queue, async (message) => {
//         const { content } = message;
//         const maxRetries = message.properties.headers['max-retries'];
//         const deliveryCount = message.properties.headers['delivery-count'] + 1;

//         try {
//           const queueHandlers = handlers[queue];

//           const routingKey =
//             message.properties.headers['original-routing-key'] ||
//             message.fields.routingKey;

//           // Find the correct handler
//           const handler = queueHandlers.find(
//             (handler) => handler.routingKey === routingKey,
//           );

//           // running that particular handler
//           await handler.controllerInstance[handler.methodName](
//             JSON.parse(content.toString()),
//           );

//           this.amqpChannel.ack(message);
//         } catch (e: any) {
//           if (deliveryCount >= maxRetries) {
//             this.sendMsgToDLQ({ message, queue, deliveryCount });
//           } else {
//             this.sendMsgForRetry({ message, queue, deliveryCount });
//           }
//         }
//       });
//     });
//   }

//   async onModuleInit() {
//     //  All the modules have resolved and initialized.
//     this.rabbitRouter = this.fetchQueuesAndHandlers();
//      // ADD THIS LOG to see the discovered routes
//   console.log('Discovered RabbitMQ Router:', JSON.stringify(this.rabbitRouter, null, 2));
//     await this.setupExchanges();
//     await this.setupQueues();
//   }

//   async onModuleDestroy() {
//     await this.amqpChannel.close();
//   }

//   onApplicationBootstrap() {
//     this.setupConsumers(this.rabbitRouter);
//   }

//   public publishMessage<T>({ message, messageMeta }: RmqProducerType<T>) {
//     const options = {
//       headers: {
//         'delivery-count': 0,
//         'max-retries': messageMeta.maxRetries,
//       },
//       messageId: messageMeta.messageId,
//       timeout: 3000, // 3sec
//     };

//     return this.amqpChannel.publish(
//       COMMON_EXCHANGE.name,
//       messageMeta.routingKey,
//       message,
//       options,
//     );
//   }
// }


import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
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
import { Message } from 'amqplib';
import { IRabbitMqHandler } from '@app/framework';
import { inspect } from 'util';

@Injectable()
export class RabbitMqService
  implements OnModuleInit, OnModuleDestroy, OnApplicationBootstrap
{
  private amqpConnection: IAmqpConnectionManager;
  private amqpChannel: ChannelWrapper;
  private rabbitRouter: IRabbitRouter;
  private readonly logger = new Logger(RabbitMqService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly discoveryService: DiscoveryService,
  ) {
    const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL');
    if (!rabbitmqUrl) {
      throw new Error('RABBITMQ_URL is not defined in the configuration.');
    }
    this.amqpConnection = amqp.connect([rabbitmqUrl]);
    this.amqpChannel = this.amqpConnection.createChannel({ json: true });

    this.amqpConnection.on('connect', () => this.logger.log('RabbitMQ Connected!'));
    this.amqpConnection.on('disconnect', (err) => this.logger.error('RabbitMQ Disconnected!', err));
  }

  private getDeadLetterQueueName(queue: string): string {
    return `${queue}.dlq`;
  }

  private fetchQueuesAndHandlers(): IRabbitRouter {
    this.logger.log('Fetching RabbitMQ consumers and handlers...');
    // Because your @RabbitMqConsumer decorator uses @Controller, we MUST use getControllers.
    const rabbitConsumers = this.discoveryService
      .getControllers()
      .filter((controller) =>
        Reflect.getMetadata(RABBITMQ_CONSUMER.identifier, controller.metatype),
      );

    this.logger.log(`Found ${rabbitConsumers.length} RabbitMQ consumer(s).`);

    const metadataScanner = new MetadataScanner();
    const router: IRabbitRouter = {};

    for (const consumer of rabbitConsumers) {
      const { instance, metatype } = consumer;
      const controllerPrototype = Object.getPrototypeOf(instance);
      const methods = metadataScanner.getAllMethodNames(controllerPrototype);

      const methodsWithRabbitHandler = methods.filter(
        (methodName) =>
          // BUG FIX: Compare against the .value property of the constant.
          Reflect.getMetadata(
            RABBITMQ_HANDLER.identifier,
            controllerPrototype[methodName],
          ) === RABBITMQ_HANDLER.value,
      );

      methodsWithRabbitHandler.forEach((methodName) => {
        const msgRouter = Reflect.getMetadata(
          RABBITMQ_ROUTER,
          controllerPrototype[methodName],
        ) as IRabbitMqHandler;

        if (!msgRouter || !msgRouter.queue || !msgRouter.routingKey) {
            this.logger.warn(`Missing router config on ${consumer.name}.${methodName}`);
            return;
        }

        const routeDetails: IRabbitHandlerInstance = {
          controllerInstance: instance,
          handlerIdentifier: `${consumer.name}-${methodName}`,
          methodName,
          controllerPrototype,
          routingKey: msgRouter.routingKey,
        };

        if (!router[msgRouter.queue]) {
          router[msgRouter.queue] = [];
        }

        if (router[msgRouter.queue].some((handler) => handler.routingKey === routeDetails.routingKey)) {
          throw new Error(`Routing key ${msgRouter.routingKey} already exists for queue ${msgRouter.queue}`);
        }

        router[msgRouter.queue].push(routeDetails);
        this.logger.log(`Mapped handler: Queue [${msgRouter.queue}] -> ${routeDetails.handlerIdentifier}`);
      });
    }
    return router;
  }

  private async setupExchanges(): Promise<void> {
    await this.amqpChannel.addSetup(async (channel) => {
        await Promise.all([
            channel.assertExchange(COMMON_EXCHANGE.name, COMMON_EXCHANGE.type, COMMON_EXCHANGE.options),
            channel.assertExchange(COMMON_EXCHANGE_DLX.name, COMMON_EXCHANGE_DLX.type, COMMON_EXCHANGE_DLX.options),
        ]);
    });
    this.logger.log('Common exchanges asserted.');
  }

  private async setupQueuesAndBindings(): Promise<void> {
     await this.amqpChannel.addSetup(async (channel) => {
        for (const queue of Object.keys(this.rabbitRouter)) {
            const dlqName = this.getDeadLetterQueueName(queue);
            // Assert main queue with DLX routing
            await channel.assertQueue(queue, {
                durable: true,
                deadLetterExchange: COMMON_EXCHANGE_DLX.name,
                deadLetterRoutingKey: dlqName, // Route rejected messages with the DLQ name
            });
            // Assert DLQ
            await channel.assertQueue(dlqName, { durable: true });
            // Bind DLQ to the DLX
            await channel.bindQueue(dlqName, COMMON_EXCHANGE_DLX.name, dlqName);
            // Bind main queue to main exchange for each routing key
            const handlers = this.rabbitRouter[queue];
            for (const handler of handlers) {
                await channel.bindQueue(queue, COMMON_EXCHANGE.name, handler.routingKey);
            }
        }
    });
    this.logger.log('Queues and bindings setup complete.');
  }

  private sendMsgToDLQ({ message, queue }: { message: Message; queue: string; }) {
    const { content } = message;
    this.logger.warn(`Message sent to DLQ for queue: ${queue}`);
    // No need to publish, RabbitMQ does this automatically with deadLetterExchange option.
    // We just need to NACK the message without requeueing.
    this.amqpChannel.nack(message, false, false);
  }

  private sendMsgForRetry({ message, queue, deliveryCount }: ISendMsgToDLQ) {
    // This logic is complex and can be handled better with delayed exchanges.
    // For now, we will simply NACK and let it go to DLQ if max retries are exceeded.
    // A proper retry requires a delay mechanism not implemented here.
    this.logger.log(`Retrying message for queue ${queue}. Attempt: ${deliveryCount}`);
    this.amqpChannel.nack(message, false, false); // Nacking to DLQ, as simple requeue is often problematic
  }

  private setupConsumers() {
    for (const queue of Object.keys(this.rabbitRouter)) {
        this.amqpChannel.consume(queue, async (message) => {
            if (!message) {
                this.logger.warn(`Received null message on queue ${queue}`);
                return;
            }

            const content = JSON.parse(message.content.toString());
            const headers = message.properties.headers;
            const maxRetries = headers['max-retries'] || 3;
            const deliveryCount = (headers['x-death']?.[0]?.count || 0) + 1;

            try {
                const queueHandlers = this.rabbitRouter[queue];
                const routingKey = message.fields.routingKey;
                const handler = queueHandlers.find(h => h.routingKey === routingKey);

                if (!handler) {
                    throw new Error(`No handler found for routing key ${routingKey} on queue ${queue}`);
                }

                await handler.controllerInstance[handler.methodName](content);
                this.amqpChannel.ack(message);
            } catch (e) {
                this.logger.error(`Error processing message from queue ${queue}:`, e);
                if (deliveryCount >= maxRetries) {
                    this.sendMsgToDLQ({ message, queue });
                } else {
                    // NACK to route to DLQ for later inspection or delayed retry
                    this.amqpChannel.nack(message, false, false);
                }
            }
        });
        this.logger.log(`Consumer attached to queue: ${queue}`);
    }
  }

  async onModuleInit() {
    this.rabbitRouter = this.fetchQueuesAndHandlers();
    this.logger.log(
      'Discovered RabbitMQ Router:',
      // Use util.inspect to safely log the complex object
      inspect(this.rabbitRouter, { showHidden: false, depth: 5, colors: true }),
    );
    
    if (Object.keys(this.rabbitRouter).length > 0) {
        await this.setupExchanges();
        await this.setupQueuesAndBindings();
    } else {
        this.logger.warn('No RabbitMQ handlers were found. Skipping queue setup.');
    }
  }

  async onModuleDestroy() {
    await this.amqpChannel.close();
    await this.amqpConnection.close();
    this.logger.log('RabbitMQ connection closed.');
  }

  onApplicationBootstrap() {
    if (Object.keys(this.rabbitRouter).length > 0) {
        this.setupConsumers();
    }
  }

  public publishMessage<T>({ message, messageMeta }: RmqProducerType<T>) {
    const options = {
      headers: {
        'delivery-count': 0,
        'max-retries': messageMeta.maxRetries || 3,
      },
      messageId: messageMeta.messageId,
      persistent: true,
      timeout: 6000, 
    };

    // The publish method returns a promise that resolves when the message is confirmed.
    return this.amqpChannel.publish(
      COMMON_EXCHANGE.name,
      messageMeta.routingKey,
      message,
      options,
    );
  }
}

