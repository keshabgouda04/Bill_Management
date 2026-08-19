import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { registerFCMToken, removeFCMToken } from './mutation/notification/notification';
import { navigate } from '../navigation/navigationRef';
import { triggerInAppNotification } from './inAppNotificationService';

/**
 * Safely access React Native Firebase v26 Messaging API & Instance.
 * Compatible with v26 modular functional API (React Native 0.81.5 / Expo SDK 54).
 */
function getFCMApi() {
  try {
    const fcmModule = require('@react-native-firebase/messaging');
    if (!fcmModule) return null;

    // 1. RN Firebase v26 Modular API (getMessaging, requestPermission, getToken, etc.)
    if (typeof fcmModule.getMessaging === 'function') {
      const messagingInstance = fcmModule.getMessaging();

      return {
        messaging: messagingInstance,
        requestPermission: async () => {
          if (typeof fcmModule.requestPermission === 'function') {
            return await fcmModule.requestPermission(messagingInstance);
          }
          return await messagingInstance?.requestPermission?.();
        },
        getToken: async () => {
          if (typeof fcmModule.getToken === 'function') {
            return await fcmModule.getToken(messagingInstance);
          }
          return await messagingInstance?.getToken?.();
        },
        onTokenRefresh: (listener: (token: string) => void) => {
          if (typeof fcmModule.onTokenRefresh === 'function') {
            return fcmModule.onTokenRefresh(messagingInstance, listener);
          }
          return messagingInstance?.onTokenRefresh?.(listener);
        },
        onMessage: (listener: (message: any) => void) => {
          if (typeof fcmModule.onMessage === 'function') {
            return fcmModule.onMessage(messagingInstance, listener);
          }
          return messagingInstance?.onMessage?.(listener);
        },
        onNotificationOpenedApp: (listener: (message: any) => void) => {
          if (typeof fcmModule.onNotificationOpenedApp === 'function') {
            return fcmModule.onNotificationOpenedApp(messagingInstance, listener);
          }
          return messagingInstance?.onNotificationOpenedApp?.(listener);
        },
        getInitialNotification: async () => {
          if (typeof fcmModule.getInitialNotification === 'function') {
            return await fcmModule.getInitialNotification(messagingInstance);
          }
          return await messagingInstance?.getInitialNotification?.();
        },
        setBackgroundMessageHandler: (handler: (message: any) => Promise<void>) => {
          if (typeof fcmModule.setBackgroundMessageHandler === 'function') {
            return fcmModule.setBackgroundMessageHandler(messagingInstance, handler);
          }
          return messagingInstance?.setBackgroundMessageHandler?.(handler);
        },
      };
    }

    // 2. Legacy fallback if messaging() was exported directly
    const legacyMessaging = fcmModule.default || fcmModule;
    if (typeof legacyMessaging === 'function') {
      const instance = legacyMessaging();
      return {
        messaging: instance,
        requestPermission: async () => instance.requestPermission(),
        getToken: async () => instance.getToken(),
        onTokenRefresh: (listener: any) => instance.onTokenRefresh(listener),
        onMessage: (listener: any) => instance.onMessage(listener),
        onNotificationOpenedApp: (listener: any) => instance.onNotificationOpenedApp(listener),
        getInitialNotification: async () => instance.getInitialNotification(),
        setBackgroundMessageHandler: (handler: any) => instance.setBackgroundMessageHandler(handler),
      };
    }

    console.warn('❌ Firebase Messaging module found but incompatible with expected exports:', Object.keys(fcmModule));
    return null;
  } catch (e) {
    console.warn('❌ Firebase Messaging native module is not available in the current build runtime.', e);
    return null;
  }
}

/**
 * Request notification permissions from the user.
 * Supports iOS and Android 13+ (API level 33).
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const fcm = getFCMApi();
  if (!fcm) return false;

  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Android POST_NOTIFICATIONS permission denied');
        return false;
      }
    }

    const authStatus = await fcm.requestPermission();
    // 1 = AUTHORIZED, 2 = PROVISIONAL
    const enabled = authStatus === 1 || authStatus === 2 || authStatus === true;

    console.log('FCM Authorization Status:', authStatus, 'Enabled:', enabled);
    return enabled;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Generate the device's FCM token and register it with the backend.
 */
export async function getAndRegisterFCMToken(): Promise<string | null> {
  const fcm = getFCMApi();
  if (!fcm) return null;

  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('Notification permission not granted. Skipping FCM token registration.');
      return null;
    }

    const fcmToken = await fcm.getToken();
    if (fcmToken) {
      console.log('FCM Token generated:', fcmToken);
      await registerFCMToken(fcmToken);
    }

    // Listen for FCM token refreshes
    fcm.onTokenRefresh(async (newToken: string) => {
      console.log('FCM Token refreshed:', newToken);
      await registerFCMToken(newToken);
    });

    return fcmToken;
  } catch (error) {
    console.error('Error fetching FCM Token:', error);
    return null;
  }
}

/**
 * Handle notification tap payloads and navigate/redirect to the target screen.
 */
export function handleNotificationTapPayload(remoteMessage: any) {
  if (!remoteMessage) return;

  console.log('Notification Tapped Payload:', remoteMessage);
  const data = remoteMessage.data || {};
  const notification = remoteMessage.notification || {};

  const billId = (data.billId || data.bill_id || data.bill) as string | undefined;
  const screen = (data.screen || data.type || data.target || data.target_screen || data.route) as string | undefined;
  const title = (notification.title || data.title || '').toLowerCase();
  const body = (notification.body || data.body || '').toLowerCase();

  // 1. Bill Details payload
  if (billId) {
    navigate('BillDetails', { billId });
    return;
  }

  // 2. Reminder & Warranty payload
  if (
    screen === 'REMINDER' ||
    screen === 'WARRANTY' ||
    title.includes('reminder') ||
    title.includes('expiring') ||
    title.includes('warranty') ||
    body.includes('reminder') ||
    body.includes('expiring') ||
    body.includes('warranty')
  ) {
    if (billId) {
      navigate('BillDetails', { billId });
      return;
    }
    navigate('ViewBills');
    return;
  }

  // 3. Family Invite / Workspace payload
  if (
    screen === 'FamilyHome' ||
    screen === 'FAMILY_INVITE' ||
    screen === 'FAMILY' ||
    screen === 'FAMILY_MEMBER_ADDED' ||
    title.includes('family') ||
    body.includes('family') ||
    body.includes('invited you')
  ) {
    navigate('FamilyHome');
    return;
  }

  // 3. Direct route matching
  if (screen === 'ViewBills' || screen === 'Search' || screen === 'Profile' || screen === 'Categories') {
    navigate(screen as any);
    return;
  }

  // Default fallback
  navigate('Dashboard');
}

/**
 * Listen for foreground notifications (when app is active).
 */
export function setupForegroundNotificationHandler() {
  const fcm = getFCMApi();
  if (!fcm) return () => {};

  try {
    return fcm.onMessage(async (remoteMessage: any) => {
      console.log('Foreground FCM Message received:', remoteMessage);

      // Trigger custom UI in-app notification popup banner instead of raw system Alert
      triggerInAppNotification(remoteMessage);
    });
  } catch (e) {
    console.warn('Could not setup foreground notification handler:', e);
    return () => {};
  }
}

/**
 * Setup background & cold-start notification tap listeners.
 */
export function setupNotificationTapHandlers() {
  const fcm = getFCMApi();
  if (!fcm) return () => {};

  try {
    // Handle background tap
    const unsubscribeOnOpened = fcm.onNotificationOpenedApp((remoteMessage: any) => {
      console.log('App opened from background by notification tap:', remoteMessage);
      handleNotificationTapPayload(remoteMessage);
    });

    // Handle cold-start tap
    fcm.getInitialNotification()
      .then((remoteMessage: any) => {
        if (remoteMessage) {
          console.log('App launched from closed state by notification tap:', remoteMessage);
          handleNotificationTapPayload(remoteMessage);
        }
      })
      .catch((err: any) => console.warn('Error fetching initial notification:', err));

    return unsubscribeOnOpened || (() => {});
  } catch (e) {
    console.warn('Could not setup notification tap handlers:', e);
    return () => {};
  }
}

/**
 * Register top-level background message handler.
 */
export function setBackgroundMessageHandler(handler: (remoteMessage: any) => Promise<void>) {
  const fcm = getFCMApi();
  if (!fcm) return;
  try {
    fcm.setBackgroundMessageHandler(handler);
  } catch (e) {
    console.warn('Could not set background message handler:', e);
  }
}

/**
 * Initialize all FCM messaging handlers safely.
 */
export async function initializeFCMNotificationService() {
  const fcm = getFCMApi();
  if (!fcm) return () => {};

  try {
    await getAndRegisterFCMToken();
    const unsubscribeForeground = setupForegroundNotificationHandler();
    const unsubscribeTap = setupNotificationTapHandlers();

    return () => {
      if (unsubscribeForeground) unsubscribeForeground();
      if (unsubscribeTap) unsubscribeTap();
    };
  } catch (error) {
    console.warn('Firebase Messaging native module is not available in the current runtime build.', error);
    return () => {};
  }
}

/**
 * Unregister the device's FCM token from backend (e.g., on logout).
 */
export async function unregisterDeviceFCMToken(): Promise<void> {
  const fcm = getFCMApi();
  if (!fcm) return;

  try {
    const token = await fcm.getToken();
    if (token) {
      console.log('Unregistering FCM Token from backend:', token);
      await removeFCMToken(token);
    }
  } catch (error) {
    console.warn('Error unregistering FCM token:', error);
  }
}

