type RmqMessageMetaType = {
  routingKey: string;
  messageId: string;
  maxRetries: 0 | 1 | 2 | 3 | 4 | 5;
};

export type RmqProducerType<T> = {
  message: T;
  messageMeta: RmqMessageMetaType;
};

export interface ISendMsgToDLQ {
  message: any;
  queue: string;
  deliveryCount: number;
}

export type IRabbitHandlerInstance = {
  controllerInstance: unknown;
  controllerPrototype: unknown;
  handlerIdentifier: string;
  methodName: string;
  routingKey: string;
};

export type IRabbitRouter = {
  [queue: string]: IRabbitHandlerInstance[];
};
