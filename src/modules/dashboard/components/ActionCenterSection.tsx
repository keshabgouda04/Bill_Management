import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ACTION_CENTER_ITEMS = [
  {
    id: '1', icon: '🚗', title: 'Car Insurance', subtitle: 'Expires Tomorrow',
    tag: 'URGENT', tagColor: '#FF4444', action: 'View Details', actionColor: '#4B65E4',
  },
  {
    id: '2', icon: '📺', title: 'Samsung Smart TV', subtitle: 'Warranty ends in 7 days',
    tag: 'HIGH PRIORITY', tagColor: '#FF8C00', action: 'View Details', actionColor: '#4B65E4',
  },
  {
    id: '3', icon: '💻', title: 'Laptop EMI', subtitle: 'Due Today',
    tag: 'UPCOMING', tagColor: '#22C55E', action: 'Pay Now', actionColor: '#22C55E',
  },
];

export const ActionCenterSection = () => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.actionCenterRow}
  >
    {ACTION_CENTER_ITEMS.map(item => (
      <View key={item.id} style={styles.actionCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>{item.icon}</Text>
          <View style={[styles.tagBadge, { backgroundColor: item.tagColor + '15' }]}>
            <Text style={[styles.tagText, { color: item.tagColor }]}>{item.tag}</Text>
          </View>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        <TouchableOpacity style={styles.cardActionBtn} activeOpacity={0.7}>
          <Text style={[styles.cardActionText, { color: item.actionColor }]}>{item.action}</Text>
          <Ionicons name="arrow-forward" size={14} color={item.actionColor} />
        </TouchableOpacity>
      </View>
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  actionCenterRow: { gap: 14, paddingVertical: 8 },
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
});
