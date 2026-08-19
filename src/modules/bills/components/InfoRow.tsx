import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';

interface InfoRowProps {
  label: string;
  value?: string | number | null;
}

const InfoRow = ({ label, value }: InfoRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const stringValue = value !== undefined && value !== null && value !== '' ? String(value) : '-';
  const isNotesOrLong = (label === 'Notes' || stringValue.length > 35) && stringValue !== '-';

  if (isNotesOrLong) {
    return (
      <View style={[styles.infoRow, styles.infoRowLong]}>
        <View style={styles.topRow}>
          <Text style={styles.infoLabel}>{label}</Text>
          <TouchableOpacity
            onPress={() => setIsExpanded(!isExpanded)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.toggleText}>
              {isExpanded ? 'See less' : 'See more'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text
          style={[styles.infoValueLong, isExpanded && styles.infoValueExpanded]}
          numberOfLines={isExpanded ? undefined : 2}
        >
          {stringValue}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>
        {stringValue}
      </Text>
    </View>
  );
};

export default InfoRow;

const styles = StyleSheet.create({
  infoRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F7',
    paddingVertical: 6,
    gap: 16,
  },
  infoRowLong: {
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingVertical: 8,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  infoLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  infoValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
  },
  infoValueLong: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'left',
  },
  infoValueExpanded: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
    lineHeight: 18,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B65E4',
  },
});
