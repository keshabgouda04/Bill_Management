import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const QUICK_ACTIONS = [
  { id: '1', icon: 'scan-outline', label: 'Scan Bill' },
  { id: '2', icon: 'document-outline', label: 'Upload PDF' },
  { id: '3', icon: 'create-outline', label: 'Manual Entry' },
  { id: '4', icon: 'list-outline', label: 'View Bills' },
];

interface QuickActionsProps {
  onScan: () => void;
  onUpload: () => void;
  onManualEntry: () => void;
  onViewBills?: () => void;
}

export const QuickActions = ({ onScan, onUpload, onManualEntry, onViewBills }: QuickActionsProps) => {
  const handlers: Record<string, () => void> = {
    'Scan Bill': onScan,
    'Upload PDF': onUpload,
    'Manual Entry': onManualEntry,
    'View Bills': onViewBills || (() => {}),
  };

  return (
    <View style={styles.quickActionsGrid}>
      {QUICK_ACTIONS.map(action => (
        <TouchableOpacity
          key={action.id}
          style={styles.quickActionItem}
          activeOpacity={0.75}
          onPress={handlers[action.label]}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name={action.icon as any} size={22} color="#4B65E4" />
          </View>
          <Text style={styles.quickActionLabel}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  quickActionsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  quickActionItem: { flex: 1, alignItems: 'center' },
  quickActionIcon: {
    width: 48, height: 48, borderRadius: 16, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02, shadowRadius: 4, elevation: 1,
  },
  quickActionLabel: { fontSize: 11, fontWeight: '600', color: '#555', marginTop: 8 },
});
