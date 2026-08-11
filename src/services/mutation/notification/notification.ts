import { Platform } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../../../constants/apiEndpoints';
import { api } from '../../../helper/axiosConfig';

/**
 * Register device FCM token with backend API.
 * Uses POST /api/v1/devices
 */
export const registerFCMToken = async (fcmToken: string) => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    const payload = {
      fcmToken,
      platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
      deviceName: Platform.OS === 'ios' ? 'iPhone' : 'Android Device',
      appVersion: '1.0.0',
      timezone,
    };

    const response = await api.post(API_URL.DEVICES.REGISTER, payload);
    return response.data;
  } catch (error) {
    console.warn('Failed to register FCM token with backend:', error);
    throw error;
  }
};

/**
 * Remove device FCM token from backend API (e.g. on Logout).
 * Uses DELETE /api/v1/devices
 */
export const removeFCMToken = async (fcmToken: string) => {
  try {
    const response = await api.delete(API_URL.DEVICES.REMOVE, {
      data: { fcmToken },
    });
    return response.data;
  } catch (error) {
    console.warn('Failed to remove FCM token from backend:', error);
    throw error;
  }
};

/**
 * Mark a single notification as read.
 * Uses PATCH /api/v1/notifications/:id/read
 */
export const markNotificationAsRead = async (notificationId: string) => {
  const response = await api.patch(API_URL.NOTIFICATIONS.MARK_READ(notificationId));
  return response.data;
};

/**
 * Mark all notifications as read.
 * Uses PATCH /api/v1/notifications/read-all
 */
export const markAllNotificationsAsRead = async () => {
  const response = await api.patch(API_URL.NOTIFICATIONS.MARK_ALL_READ);
  return response.data;
};

/**
 * Delete a single notification.
 * Uses DELETE /api/v1/notifications/:id
 */
export const deleteNotification = async (notificationId: string) => {
  try {
    const response = await api.delete(API_URL.NOTIFICATIONS.DELETE(notificationId));
    return response.data;
  } catch (error) {
    console.error('Failed to delete notification:', error);
    throw error;
  }
};

// ── TanStack Query Mutation Hooks ────────────────────────────────────────────

/**
 * TanStack Mutation Hook to register FCM token.
 */
export const useRegisterFCMToken = () => {
  return useMutation({
    mutationFn: (fcmToken: string) => registerFCMToken(fcmToken),
  });
};

/**
 * TanStack Mutation Hook to remove FCM token (logout).
 */
export const useRemoveFCMToken = () => {
  return useMutation({
    mutationFn: (fcmToken: string) => removeFCMToken(fcmToken),
  });
};

/**
 * TanStack Mutation Hook to mark a single notification as read.
 * Automatically invalidates notification query cache on success.
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

/**
 * TanStack Mutation Hook to mark all notifications as read.
 * Automatically invalidates notification query cache on success.
 */
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

/**
 * TanStack Mutation Hook to delete a single notification.
 * Automatically invalidates notification query cache on success.
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
