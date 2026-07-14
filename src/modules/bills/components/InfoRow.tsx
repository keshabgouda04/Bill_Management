import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => {
    return (

        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue} numberOfLines={2}>{value || '-'}</Text>
        </View>
    );
}


export default InfoRow

const styles = StyleSheet.create({
    infoRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F7',
    gap: 16,
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
})

