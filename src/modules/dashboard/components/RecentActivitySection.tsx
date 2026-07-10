import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SectionHeader } from '../../../components/common/SectionHeader';

const RECENT_ACTIVITY = [
  { id: '1', icon: 'cloud-upload-outline', text: 'Uploaded Samsung TV Bill', time: '2h ago', color: '#4B65E4' },
  { id: '2', icon: 'checkmark-circle-outline', text: 'OCR Analysis Completed', time: '3h ago', color: '#22C55E' },
];

export const RecentActivitySection = () => (
  <>
    <SectionHeader title="Recent Activity" />
    <View style={styles.card}>
      {RECENT_ACTIVITY.map((item, index) => (
        <View key={item.id}>
          <View style={styles.activityRow}>
            <View style={[styles.activityIcon, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon as any} size={18} color={item.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.activityText}>{item.text}</Text>
              <Text style={styles.activityTime}>{item.time}</Text>
            </View>
          </View>
          {index < RECENT_ACTIVITY.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
    </View>
  </>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02, shadowRadius: 6, elevation: 2,
  },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  activityIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  activityText: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
  activityTime: { fontSize: 11, color: '#999', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 14 },
});
