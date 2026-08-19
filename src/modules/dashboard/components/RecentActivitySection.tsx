import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../navigation/AppNavigator';
import { SectionHeader } from '../../../components/common/SectionHeader';
import { useGetBills, Bill } from '../../../services/query/bills/bills';
import { useGetNotifications, NotificationItem } from '../../../services/query/notification/notification';
import { formatAmount } from '../../bills/utils/billUtils';
import { formatTimeAgo } from '../../../utils/dateUtils';
import { handleNotificationTapPayload } from '../../../services/messagingService';

interface ActivityEvent {
  id: string;
  icon: string;
  text: string;
  subtext?: string;
  time: string;
  color: string;
  timestamp: number;
  onPress?: () => void;
}

export const RecentActivitySection = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { data: billsData, isLoading: loadingBills } = useGetBills(1, 5);
  const { data: notificationsData, isLoading: loadingNotifications } = useGetNotifications(5);

  const rawBills = billsData?.data?.bills || (Array.isArray(billsData) ? billsData : []);
  const rawNotifications = Array.isArray(notificationsData) ? notificationsData : [];

  const activities: ActivityEvent[] = [];

  // Transform bills into activity events
  rawBills.forEach((b: Bill) => {
    const rawDate = b.created_at || b.purchase_date;
    const ts = rawDate ? new Date(rawDate).getTime() : 0;
    const storeName = b.purchase_location?.trim() || `Invoice #${b.invoice_number || 'Bill'}`;

    activities.push({
      id: `bill-${b.id}`,
      icon: b.bill_status === 'PROCESSED' ? 'checkmark-circle-outline' : 'receipt-outline',
      text: `Uploaded ${storeName}`,
      subtext: b.total_amount ? formatAmount(b.total_amount, b.currency) : undefined,
      time: formatTimeAgo(rawDate),
      color: b.bill_status === 'PROCESSED' ? '#22C55E' : '#4B65E4',
      timestamp: ts,
      onPress: () => navigation.navigate('BillDetails', { billId: b.id }),
    });
  });

  // Transform notifications into activity events
  rawNotifications.forEach((n: NotificationItem) => {
    const ts = n.created_at ? new Date(n.created_at).getTime() : 0;
    activities.push({
      id: `notif-${n.id}`,
      icon: 'notifications-outline',
      text: n.title || 'System Notification',
      subtext: n.message || n.body || undefined,
      time: formatTimeAgo(n.created_at),
      color: '#F59E0B',
      timestamp: ts,
      onPress: () => handleNotificationTapPayload(n),
    });
  });

  // Sort descending by timestamp and take top 4
  activities.sort((a, b) => b.timestamp - a.timestamp);
  const displayActivities = activities.slice(0, 4);

  const isLoading = loadingBills && loadingNotifications;

  return (
    <>
      <SectionHeader title="Recent Activity" />
      <View style={styles.card}>
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#4B65E4" />
            <Text style={styles.loadingText}>Loading recent activity...</Text>
          </View>
        ) : displayActivities.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="time-outline" size={32} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No recent activity yet</Text>
            <Text style={styles.emptySub}>Scan or upload a bill to see updates here.</Text>
          </View>
        ) : (
          displayActivities.map((item, index) => (
            <View key={item.id}>
              <TouchableOpacity
                style={styles.activityRow}
                onPress={item.onPress}
                activeOpacity={item.onPress ? 0.7 : 1}
              >
                <View style={[styles.activityIcon, { backgroundColor: item.color + '1A' }]}>
                  <Ionicons name={item.icon as any} size={18} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityText} numberOfLines={1}>
                    {item.text}
                  </Text>
                  {item.subtext ? (
                    <Text style={styles.activitySubtext} numberOfLines={1}>
                      {item.subtext}
                    </Text>
                  ) : null}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.activityTime}>{item.time}</Text>
                  {item.onPress && (
                    <Ionicons name="chevron-forward" size={14} color="#CBD5E1" style={{ marginTop: 2 }} />
                  )}
                </View>
              </TouchableOpacity>
              {index < displayActivities.length - 1 && <View style={styles.divider} />}
            </View>
          ))
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  activitySubtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  loadingBox: {
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  emptyBox: {
    paddingVertical: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },
});
