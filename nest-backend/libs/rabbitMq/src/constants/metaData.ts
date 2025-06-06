//  Here we have defined the meta data for the rabbitmq consumer and handler that we can attach to the controller and the method to identify them
export const RABBITMQ_CONSUMER = {
  identifier: Symbol('__RABBITMQ_CONSUMER__'),
  value: true,
} as const;

export const RABBITMQ_HANDLER = {
  identifier: Symbol('__RABBITMQ_HANDLER__'),
  value: true,
} as const;

export const RABBITMQ_ROUTER = Symbol('__RABBITMQ_ROUTER__');
