import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/AppNavigator';
import { useGetBills, useGetBillsInfinite } from '../../bills/api/billsApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
type Nav = NativeStackNavigationProp<AppStackParamList>;

const getEmojiIcon = (invoiceNumber?: string | null) => {
  const term = (invoiceNumber || '').toLowerCase();
  if (term.includes('phone') || term.includes('mobile') || term.includes('iphone')) return '📱';
  if (term.includes('headphone') || term.includes('sony') || term.includes('audio')) return '🎧';
  if (term.includes('monitor') || term.includes('dell') || term.includes('screen') || term.includes('display')) return '🖥️';
  if (term.includes('laptop') || term.includes('macbook') || term.includes('computer')) return '💻';
  if (term.includes('tv') || term.includes('television') || term.includes('samsung')) return '📺';
  if (term.includes('car') || term.includes('vehicle') || term.includes('insurance')) return '🚗';
  return '📦';
};

const getExpiryConfig = (diffDays: number) => {
  if (diffDays <= 1) {
    return {
      subtitle: 'Expires Tomorrow',
      tag: 'URGENT',
      tagColor: '#FF4444',
      action: 'View Details',
      actionColor: '#4B65E4',
    };
  } else if (diffDays <= 7) {
    return {
      subtitle: `Warranty ends in ${diffDays} days`,
      tag: 'HIGH PRIORITY',
      tagColor: '#FF8C00',
      action: 'View Details',
      actionColor: '#4B65E4',
    };
  } else {
    return {
      subtitle: `Warranty ends in ${diffDays} days`,
      tag: 'UPCOMING',
      tagColor: '#22C55E',
      action: 'View Details',
      actionColor: '#4B65E4',
    };
  }
};

export const ActionCenterSection = () => {
  const navigation = useNavigation<Nav>();
  const { data, isLoading } = useGetBillsInfinite(10);

  const bills = data?.pages.flatMap((page) => page.data?.bills || []) || [];
  const now = Date.now();

  interface ExpiringItem {
    id: string;
    billId: string;
    emoji: string;
    title: string;
    subtitle: string;
    tag: string;
    tagColor: string;
    action: string;
    actionColor: string;
    expiryTime: number;
  }

  const expiringItems: ExpiringItem[] = [];

  bills.forEach((bill) => {
    if (!bill.bill_items || !bill.purchase_date) return;

    bill.bill_items.forEach((item) => {
      if (typeof item.warranty_months === 'number' && item.warranty_months > 0) {
        const purchaseDate = new Date(bill.purchase_date);
        const expiryDate = new Date(purchaseDate);
        expiryDate.setMonth(expiryDate.getMonth() + item.warranty_months);

        const diffTime = expiryDate.getTime() - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0 && diffDays <= 7) {
          const emoji = getEmojiIcon(item.item_name);
          const cfg = getExpiryConfig(diffDays);
          expiringItems.push({
            id: item.id,
            billId: bill.id,
            emoji,
            title: item.item_name,
            subtitle: cfg.subtitle,
            tag: cfg.tag,
            tagColor: cfg.tagColor,
            action: cfg.action,
            actionColor: cfg.actionColor,
            expiryTime: expiryDate.getTime(),
          });
        }
      }
    });
  });

  // Sort by closest expiry date
  expiringItems.sort((a, b) => a.expiryTime - b.expiryTime);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#4B65E4" />
        <Text style={styles.loadingText}>Checking active warranties...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.actionCenterRow,
        expiringItems.length <= 1 && { justifyContent: 'center', paddingHorizontal: 0 }
      ]}
    >
      {expiringItems.length > 0 ? (
        expiringItems.map((item) => (
          <View key={item.id} style={styles.actionCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>{item.emoji}</Text>
              <View style={[styles.tagBadge, { backgroundColor: item.tagColor + '15' }]}>
                <Text style={[styles.tagText, { color: item.tagColor }]}>{item.tag}</Text>
              </View>
            </View>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            <TouchableOpacity
              style={styles.cardActionBtn}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('BillDetails', { billId: item.billId })}
            >
              <Text style={[styles.cardActionText, { color: item.actionColor }]}>{item.action}</Text>
              <Ionicons name="arrow-forward" size={14} color={item.actionColor} />
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <View style={styles.actionCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🛡️</Text>
            <View style={[styles.tagBadge, { backgroundColor: '#22C55E15' }]}>
              <Text style={[styles.tagText, { color: '#22C55E' }]}>SECURE</Text>
            </View>
          </View>
          <Text style={styles.cardTitle}>All Devices Secure</Text>
          <Text style={styles.cardSubtitle}>No warranties expiring soon</Text>
          <TouchableOpacity
            style={styles.cardActionBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ViewBills')}
          >
            <Text style={[styles.cardActionText, { color: '#4B65E4' }]}>View All Bills</Text>
            <Ionicons name="arrow-forward" size={14} color="#4B65E4" />
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actionCenterRow: {
    flexGrow: 1,
    gap: 14,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  actionCard: {
    width: SCREEN_WIDTH * 0.72, backgroundColor: '#FFF', borderRadius: 20,
    padding: 16, borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03, shadowRadius: 8, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardIcon: { fontSize: 24 },
  tagBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginTop: 14 },
  cardSubtitle: { fontSize: 12, color: '#999', marginTop: 4 },
  cardActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 16, alignSelf: 'flex-start' },
  cardActionText: { fontSize: 13, fontWeight: '600' },
  loadingContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#FFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  loadingText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
});
