export interface InAppNotificationPayload {
  title?: string;
  body?: string;
  remoteMessage?: any;
}

type NotificationListener = (payload: InAppNotificationPayload) => void;
const listeners: Set<NotificationListener> = new Set();

/**
 * Trigger an in-app notification popup banner.
 */
export function triggerInAppNotification(remoteMessage: any) {
  const title = remoteMessage?.notification?.title || remoteMessage?.data?.title || 'Notification';
  const body = remoteMessage?.notification?.body || remoteMessage?.data?.body || '';

  const payload: InAppNotificationPayload = {
    title,
    body,
    remoteMessage,
  };

  listeners.forEach((listener) => listener(payload));
}

/**
 * Subscribe to in-app notification triggers.
 */
export function subscribeInAppNotification(listener: NotificationListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
