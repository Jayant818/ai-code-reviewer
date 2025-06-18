export type IRabbitExchange = {
  name: string;
  type: 'direct' | 'fanout' | 'topic' | 'headers';
  options?: {
    durable?: boolean;
    arguments: {
      [key: string]: string;
    };
  };
};

export const COMMON_EXCHANGE: IRabbitExchange = {
  name: 'COMMON_EXCHANGE',
  type: 'direct',
} as const;

export const COMMON_EXCHANGE_DLX: IRabbitExchange = {
  name: 'COMMON_EXCHANGE_DLX',
  type: 'direct',
} as const;
