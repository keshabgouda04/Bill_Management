import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  useGetNotifications,
  NotificationItem,
} from '../../../services/query/notification/notification';
import {
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from '../../../services/mutation/notification/notification';
import { handleNotificationTapPayload } from '../../../services/messagingService';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

function formatRelativeTime(dateString: string): string {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 172800) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function NotificationsModal({ visible, onClose }: NotificationsModalProps) {
  const [filterTab, setFilterTab] = useState<'ALL' | 'UNREAD'>('ALL');
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});
  
  const { data: notifications = [], isLoading, isRefetching, refetch } = useGetNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllReadMutation = useMarkAllNotificationsAsRead();
  const deleteMutation = useDeleteNotification();

  useEffect(() => {
    if (visible) {
      refetch();
    }
  }, [visible, refetch]);

  const handleNotificationPress = (item: NotificationItem) => {
    if (!item.is_read) {
      markAsReadMutation.mutate(item.id);
    }
    onClose();
    const payloadObj = typeof item.payload === 'object' ? item.payload : item.data || {};
    handleNotificationTapPayload({
      data: {
        ...(payloadObj || {}),
        type: item.type || payloadObj?.type || payloadObj?.screen,
        screen: payloadObj?.screen || item.type,
      },
      notification: {
        title: item.title,
        body: item.message || item.body,
      },
    });
  };

  const handleDelete = (item: NotificationItem) => {
    if (deletingIds[item.id]) return;

    setDeletingIds((prev) => ({ ...prev, [item.id]: true }));

    deleteMutation.mutate(item.id, {
      onError: () => {
        setDeletingIds((prev) => ({ ...prev, [item.id]: false }));
      },
    });
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const allNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = allNotifications.filter((n) => !n.is_read).length;

  const filteredNotifications = filterTab === 'UNREAD'
    ? allNotifications.filter((n) => !n.is_read)
    : allNotifications;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* ── Header Bar ── */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerIconCircle}>
              <Ionicons name="notifications" size={20} color="#4B65E4" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Notifications</Text>
              <Text style={styles.headerSubtitle}>
                {unreadCount > 0 ? `${unreadCount} unread update(s)` : 'All caught up'}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={handleMarkAllRead}
                disabled={markAllReadMutation.isPending}
                style={styles.markAllBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="checkmark-done-outline" size={16} color="#4B65E4" style={{ marginRight: 4 }} />
                <Text style={styles.markAllText}>Mark all read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Filter Tabs Bar ── */}
        {allNotifications.length > 0 && (
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabItem, filterTab === 'ALL' && styles.tabItemActive]}
              onPress={() => setFilterTab('ALL')}
            >
              <Text style={[styles.tabText, filterTab === 'ALL' && styles.tabTextActive]}>
                All ({allNotifications.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabItem, filterTab === 'UNREAD' && styles.tabItemActive]}
              onPress={() => setFilterTab('UNREAD')}
            >
              <Text style={[styles.tabText, filterTab === 'UNREAD' && styles.tabTextActive]}>
                Unread ({unreadCount})
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Content Body ── */}
        {isLoading && !isRefetching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4B65E4" />
            <Text style={styles.loadingText}>Fetching inbox...</Text>
          </View>
        ) : filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name={filterTab === 'UNREAD' ? 'mail-open-outline' : 'notifications-off-outline'}
                size={44}
                color="#94A3B8"
              />
            </View>
            <Text style={styles.emptyTitle}>
              {filterTab === 'UNREAD' ? 'No Unread Notifications' : 'Inbox is Empty'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {filterTab === 'UNREAD'
                ? 'All your notifications have been marked as read.'
                : 'You have no notifications in your inbox at the moment.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredNotifications}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={['#4B65E4']} />
            }
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isUnread = !item.is_read;
              const isFamilyEvent =
                item.type?.includes('FAMILY') ||
                item.title?.toLowerCase().includes('family') ||
                item.message?.toLowerCase().includes('family') ||
                item.message?.toLowerCase().includes('invitation');

              const isBillEvent =
                item.type?.includes('BILL') ||
                item.title?.toLowerCase().includes('bill');

              return (
                <TouchableOpacity
                  style={[styles.itemCard, isUnread && styles.itemCardUnread]}
                  activeOpacity={0.8}
                  onPress={() => handleNotificationPress(item)}
                >
                  <View style={styles.cardHeaderRow}>
                    {/* Left Icon Badge */}
                    <View
                      style={[
                        styles.badgeIcon,
                        isFamilyEvent
                          ? styles.badgeFamily
                          : isBillEvent
                          ? styles.badgeBill
                          : styles.badgeGeneral,
                      ]}
                    >
                      <Ionicons
                        name={isFamilyEvent ? 'people' : isBillEvent ? 'receipt' : 'notifications'}
                        size={18}
                        color={isFamilyEvent ? '#4B65E4' : isBillEvent ? '#059669' : '#64748B'}
                      />
                    </View>

                    {/* Notification Details */}
                    <View style={styles.textContainer}>
                      <View style={styles.titleRow}>
                        {isUnread && <View style={styles.unreadDot} />}
                        <Text
                          style={[styles.itemTitle, isUnread && styles.itemTitleUnread]}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                      </View>

                      {(item.body || item.message) && (
                        <Text style={styles.itemMessage} numberOfLines={2}>
                          {item.body || item.message}
                        </Text>
                      )}

                      <Text style={styles.itemTime}>{formatRelativeTime(item.created_at)}</Text>
                    </View>

                    {/* Delete Action Button */}
                    {(() => {
                      const isDeleting = Boolean(deletingIds[item.id]);
                      return (
                        <TouchableOpacity
                          style={[styles.deleteBtn, isDeleting && styles.deleteBtnDisabled]}
                          onPress={() => handleDelete(item)}
                          disabled={isDeleting}
                          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                          activeOpacity={0.6}
                        >
                          {isDeleting ? (
                            <ActivityIndicator size="small" color="#94A3B8" />
                          ) : (
                            <Ionicons name="close-outline" size={18} color="#94A3B8" />
                          )}
                        </TouchableOpacity>
                      );
                    })()}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B65E4',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  tabItem: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabItemActive: {
    backgroundColor: '#4B65E4',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  itemCardUnread: {
    backgroundColor: '#FFFFFF',
    borderColor: '#C7D2FE',
    borderLeftWidth: 4,
    borderLeftColor: '#4B65E4',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  badgeIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeFamily: {
    backgroundColor: '#EEF2FF',
  },
  badgeBill: {
    backgroundColor: '#ECFDF5',
  },
  badgeGeneral: {
    backgroundColor: '#F1F5F9',
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#4B65E4',
    marginRight: 6,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  itemTitleUnread: {
    fontWeight: '700',
    color: '#0F172A',
  },
  itemMessage: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 6,
  },
  itemTime: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnDisabled: {
    opacity: 0.5,
  },
});
