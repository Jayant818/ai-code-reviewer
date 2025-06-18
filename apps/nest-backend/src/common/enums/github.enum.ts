export const INSTALLATION_EVENTS = {
    CREATED: 'created',
    DELETED: 'deleted',
    UPDATED: 'updated',
} as const;

export type INSTALLATION_EVENTS_TYPES = typeof INSTALLATION_EVENTS[keyof typeof INSTALLATION_EVENTS];

export const INSTALLATION_EVENT_VALUES = Object.values(INSTALLATION_EVENTS);


export const ACCOUNT_TYPES = {
    ORGANIZATION : 'Organization',
    USER :'User',
} as const;


export type IACCOUNT_TYPES = typeof ACCOUNT_TYPES[keyof typeof ACCOUNT_TYPES];

export const ACCOUNT_VALUES = Object.values(ACCOUNT_TYPES);

export const PERMISSION_TYPES = {
  READ: "read",
  WRITE: "write",
} as const;

export type IPERMISSION_TYPE = typeof PERMISSION_TYPES[keyof typeof PERMISSION_TYPES];

export const PERMISSION_VALUES = Object.values(PERMISSION_TYPES);

export const EVENTS = ["check_run", "check_suite", "pull_request"] as const

