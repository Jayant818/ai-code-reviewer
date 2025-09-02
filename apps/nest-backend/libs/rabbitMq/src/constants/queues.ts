export const RABBITMQ_QUEUES = {
  AI: {
    MAIN_QUEUE: 'ai-tasks-queue',
  },
  GITHUB: {
    PULL_REQUEST_QUEUE: 'github-pull-request-queue',
    FILE_REVIEW_QUEUE: 'file-review-queue',
    COMMENT_QUEUE: 'github-comment-queue',
  },
} as const;
