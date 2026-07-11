import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface BillItem {
  id: string;
  name: string;
  store: string;
  amount: string;
  date: string;
  status: 'Warranty active' | 'Expired' | 'No warranty';
  category: string;
  thumbnail?: string;
}

interface CategoryCardProps {
  item: BillItem;
  onPress?: () => void;
}

export const CategoryCard = ({ item, onPress }: CategoryCardProps) => {
  const isActive = item.status === 'Warranty active';
  const isExpired = item.status === 'Expired';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {/* Thumbnail */}
      <View style={styles.thumbnail}>
        <Ionicons name="receipt-outline" size={22} color="#4B65E4" />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.store}>{item.store}</Text>
        <View style={styles.meta}>
          <View style={[styles.badge, isActive ? styles.badgeGreen : isExpired ? styles.badgeRed : styles.badgeGray]}>
            <View style={[styles.dot, isActive ? styles.dotGreen : isExpired ? styles.dotRed : styles.dotGray]} />
            <Text style={[styles.badgeText, isActive ? styles.badgeTextGreen : isExpired ? styles.badgeTextRed : styles.badgeTextGray]}>
              {item.status}
            </Text>
          </View>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
      </View>

      {/* Amount + Arrow */}
      <View style={styles.right}>
        <Text style={styles.amount}>{item.amount}</Text>
        <Ionicons name="chevron-forward" size={16} color="#CCC" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
  store: { fontSize: 12, color: '#999', marginBottom: 6 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 4,
  },
  badgeGreen: { backgroundColor: '#ECFDF5' },
  badgeRed: { backgroundColor: '#FFF1F2' },
  badgeGray: { backgroundColor: '#F5F5F5' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotGreen: { backgroundColor: '#10B981' },
  dotRed: { backgroundColor: '#EF4444' },
  dotGray: { backgroundColor: '#9CA3AF' },
  badgeText: { fontSize: 10, fontWeight: '600' },
  badgeTextGreen: { color: '#10B981' },
  badgeTextRed: { color: '#EF4444' },
  badgeTextGray: { color: '#6B7280' },
  dateText: { fontSize: 10, color: '#BDBDBD' },
  right: { alignItems: 'flex-end', gap: 6 },
  amount: { fontSize: 14, fontWeight: '800', color: '#1A1A1A' },
});
