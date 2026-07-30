export const API_URL = {
  USER: {
    PROFILE: '/api/v1/profile',
  },
  BILLS: {
    LIST: '/api/v1/bills',
    CREATE: '/api/v1/bills',
    CREATE_MANUAL: '/api/v1/bills/manual',
    DETAIL: '/api/v1/bills',
    SEARCH: '/api/v1/bills/search',
  },
  ATTACHMENTS: {
    CREATE: '/api/v1/attachments',
  },
  FAMILY: {
    GET: '/api/v1/family',
    CREATE: '/api/v1/family',
    MEMBERS: '/api/v1/family/members',
    INVITE: '/api/v1/family/invite',
    INVITATIONS: '/api/v1/family/invitations',
    ACCEPT_INVITE: (memberId: string) => `/api/v1/family/invitations/${memberId}/accept`,
    REJECT_INVITE: (memberId: string) => `/api/v1/family/invitations/${memberId}/reject`,
    CANCEL_INVITE: (id: string) => `/api/v1/family/invite/${id}`, // Backend might not have this explicitly, keeping it for now
    CHANGE_ROLE: (id: string) => `/api/v1/family/members/${id}`,
    REMOVE_MEMBER: (id: string) => `/api/v1/family/members/${id}`,
    DELETE: '/api/v1/family',
  },
};
