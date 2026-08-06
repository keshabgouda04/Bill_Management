export const API_URL = {
  USER: {
    PROFILE: '/api/v1/profile',
  },
  DEVICES: {
    REGISTER: '/api/v1/devices',
    REMOVE: '/api/v1/devices',
  },
  NOTIFICATIONS: {
    LIST: '/api/v1/notifications',
    MARK_READ: (id: string) => `/api/v1/notifications/${id}/read`,
    MARK_ALL_READ: '/api/v1/notifications/read-all',
    DELETE: (id: string) => `/api/v1/notifications/${id}`,
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
    CANCEL_INVITE: (id: string) => `/api/v1/family/invite/${id}`,
    CHANGE_ROLE: (id: string) => `/api/v1/family/members/${id}`,
    REMOVE_MEMBER: (id: string) => `/api/v1/family/members/${id}`,
    DELETE: '/api/v1/family',
    VAULT: '/api/v1/family/vault',
    VAULT_DETAIL: (sharedBillId: string) => `/api/v1/family/vault/${sharedBillId}`,
    VAULT_VISIBILITY: (sharedBillId: string) => `/api/v1/family/vault/${sharedBillId}/visibility`,
  },
  VISITING_CARDS: {
    LIST: '/api/v1/visiting-cards',
    CREATE: '/api/v1/visiting-cards',
    DETAIL: (id: string) => `/api/v1/visiting-cards/${id}`,
    UPDATE: (id: string) => `/api/v1/visiting-cards/${id}`,
    DELETE: (id: string) => `/api/v1/visiting-cards/${id}`,
  },
};
