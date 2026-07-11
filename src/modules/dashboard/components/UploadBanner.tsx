import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UploadBannerProps {
  onPress: () => void;
}

export const UploadBanner = ({ onPress }: UploadBannerProps) => (
  <TouchableOpacity style={styles.uploadBanner} activeOpacity={0.85} onPress={onPress}>
    <View style={styles.uploadLeft}>
      <Ionicons name="cloud-upload-outline" size={28} color="#FFF" />
      <View style={{ marginLeft: 12 }}>
        <Text style={styles.uploadTitle}>Upload Bill</Text>
        <Text style={styles.uploadSub}>PDFs, Images, Receipts up to 10MB</Text>
      </View>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#FFF" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  uploadBanner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#4B65E4', borderRadius: 20, padding: 18,
    shadowColor: '#4B65E4', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 12, elevation: 8,
  },
  uploadLeft: { flexDirection: 'row', alignItems: 'center' },
  uploadTitle: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  uploadSub: { color: 'rgba(255, 255, 255, 0.75)', fontSize: 11, marginTop: 2 },
});
