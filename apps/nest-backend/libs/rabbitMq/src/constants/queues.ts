export const RABBITMQ_QUEUES = {
  AI: {
    MAIN_QUEUE: 'ai-tasks-queue',
  },
  GITHUB: {
    PULL_REQUEST_QUEUE: 'github-pull-request-queue',
  },
} as const;
