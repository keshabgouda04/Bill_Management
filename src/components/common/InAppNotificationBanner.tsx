import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  PanResponder,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { handleNotificationTapPayload } from '../../services/messagingService';

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

export default function InAppNotificationBanner() {
  const [notification, setNotification] = useState<InAppNotificationPayload | null>(null);
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-150)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const targetYPosition = Platform.OS === 'ios' ? 50 : 40;

  // Swipe gesture handler (PanResponder) to support Left Swipe & Swipe Up dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4;
      },
      onPanResponderMove: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
          // Horizontal drag (left / right)
          translateX.setValue(gestureState.dx);
        } else if (gestureState.dy < 0) {
          // Vertical swipe up
          translateY.setValue(targetYPosition + gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Dismiss if swiped left (dx < -25), fast left (vx < -0.2), swiped right (dx > 50), or swiped up (dy < -15)
        if (
          gestureState.dx < -25 ||
          gestureState.vx < -0.2 ||
          gestureState.dx > 60 ||
          gestureState.dy < -15 ||
          gestureState.vy < -0.2
        ) {
          const dir = gestureState.dx < -15 ? 'LEFT' : gestureState.dx > 30 ? 'RIGHT' : 'UP';
          hideBanner(dir);
        } else {
          // Spring back to original position
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 6,
            }),
            Animated.spring(translateY, {
              toValue: targetYPosition,
              useNativeDriver: true,
              bounciness: 6,
            }),
          ]).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    const handleEvent: NotificationListener = (payload) => {
      setNotification(payload);
      showBanner();
    };

    listeners.add(handleEvent);
    return () => {
      listeners.delete(handleEvent);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const showBanner = () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    translateX.setValue(0);
    translateY.setValue(-150);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: targetYPosition,
        useNativeDriver: true,
        bounciness: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss after 7 seconds
    timerRef.current = setTimeout(() => {
      hideBanner('UP');
    }, 7000);
  };

  const hideBanner = (direction: 'LEFT' | 'RIGHT' | 'UP' = 'LEFT') => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const toX = direction === 'LEFT' ? -400 : direction === 'RIGHT' ? 400 : 0;
    const toY = direction === 'UP' ? -180 : targetYPosition;

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: toX,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: toY,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setNotification(null);
      translateX.setValue(0);
    });
  };

  const handlePressView = () => {
    const remoteMessage = notification?.remoteMessage;
    hideBanner('UP');
    if (remoteMessage) {
      handleNotificationTapPayload(remoteMessage);
    }
  };

  if (!notification) return null;

  const isFamilyInvite =
    notification.title?.toLowerCase().includes('family') ||
    notification.remoteMessage?.data?.screen === 'FamilyHome' ||
    notification.remoteMessage?.data?.type === 'FAMILY_INVITE' ||
    notification.remoteMessage?.data?.type === 'FAMILY_MEMBER_JOINED';

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.container,
        {
          transform: [{ translateX }, { translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={handlePressView}
        style={styles.card}
      >
        {/* Top Swipe Indicator Pill */}
        <View style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>

        <View style={styles.headerRow}>
          <View style={[styles.iconBadge, isFamilyInvite && styles.familyIconBadge]}>
            <Ionicons
              name={isFamilyInvite ? 'people' : 'notifications'}
              size={20}
              color={isFamilyInvite ? '#4B65E4' : '#1A1A1A'}
            />
          </View>
          <View style={styles.textColumn}>
            <Text style={styles.title} numberOfLines={1}>
              {notification.title}
            </Text>
            {Boolean(notification.body) && (
              <Text style={styles.body} numberOfLines={2}>
                {notification.body}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => hideBanner('LEFT')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={18} color="#888" />
          </TouchableOpacity>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.dismissBtn}
            onPress={() => hideBanner('LEFT')}
            activeOpacity={0.7}
          >
            <Text style={styles.dismissBtnText}>Dismiss</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={handlePressView}
            activeOpacity={0.8}
          >
            <Text style={styles.viewBtnText}>View</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    zIndex: 999999,
    elevation: 999999,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 4,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  familyIconBadge: {
    backgroundColor: '#EEF2FF',
  },
  textColumn: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  body: {
    fontSize: 13,
    color: '#555555',
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  dismissBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F5F7FA',
  },
  dismissBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#4B65E4',
  },
  viewBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
