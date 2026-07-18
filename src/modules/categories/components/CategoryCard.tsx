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

const CATEGORY_ICONS: Record<string, string> = {
  electronics: 'flash-outline',
  vehicle: 'car-outline',
  furniture: 'bed-outline',
  home: 'home-outline',
  shopping: 'basket-outline',
};

export const CategoryCard = ({ item, onPress }: CategoryCardProps) => {
  const isActive = item.status === 'Warranty active';
  const isExpired = item.status === 'Expired';

  const categoryKey = item.category.toLowerCase();
  const iconName = CATEGORY_ICONS[categoryKey] || 'receipt-outline';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {/* Thumbnail */}
      <View style={styles.thumbnail}>
        <Ionicons name={iconName as any} size={22} color="#4B65E4" />
      </View>

      {/* Info Container */}
      <View style={styles.infoContainer}>
        {/* Row 1: Name and Amount */}
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.amount}>{item.amount}</Text>
        </View>

        {/* Row 2: Store */}
        <Text style={styles.store}>{item.store}</Text>

        {/* Row 3: Badges and Date */}
        <View style={styles.bottomRow}>
          <View style={styles.badgeGroup}>
            {/* Status Badge */}
            <View style={[styles.badge, isActive ? styles.badgeGreen : isExpired ? styles.badgeRed : styles.badgeGray]}>
              <View style={[styles.dot, isActive ? styles.dotGreen : isExpired ? styles.dotRed : styles.dotGray]} />
              <Text style={[styles.badgeText, isActive ? styles.badgeTextGreen : isExpired ? styles.badgeTextRed : styles.badgeTextGray]}>
                {item.status}
              </Text>
            </View>

            {/* Category Badge */}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
              </Text>
            </View>
          </View>

          {/* Date */}
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
      </View>

      {/* Chevron Arrow */}
      <View style={styles.chevronBox}>
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
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F6FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 8,
  },
  amount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  store: {
    fontSize: 11,
    color: '#999',
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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
  categoryBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4B65E4',
  },
  dateText: {
    fontSize: 10,
    color: '#999',
  },
  chevronBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
