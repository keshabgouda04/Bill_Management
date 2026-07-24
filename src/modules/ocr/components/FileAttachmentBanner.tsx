import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FileAttachmentBannerProps {
  fileName: string;
  fileUri: string;
  fileType: string;
}

export default function FileAttachmentBanner({
  fileName,
  fileUri,
  fileType,
}: FileAttachmentBannerProps) {
  const isImage = fileType.includes('image');

  return (
    <View style={styles.attachmentBanner}>
      {isImage ? (
        <View style={styles.imagePreviewWrapper}>
          <Image source={{ uri: fileUri }} style={styles.imagePreview} />
          <View style={styles.attachmentMeta}>
            <Text style={styles.attachmentTitle} numberOfLines={1}>{fileName}</Text>
            <Text style={styles.attachmentSub}>Captured Photo Bill</Text>
          </View>
        </View>
      ) : (
        <View style={styles.pdfPreviewWrapper}>
          <View style={styles.pdfIconCircle}>
            <Ionicons name="document-outline" size={24} color="#FFF" />
          </View>
          <View style={[styles.attachmentMeta, { marginLeft: 12 }]}>
            <Text style={styles.attachmentTitle} numberOfLines={1}>{fileName}</Text>
            <Text style={styles.attachmentSub}>Uploaded PDF Document</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  attachmentBanner: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#EBEBEB',
  },
  imagePreviewWrapper: { flexDirection: 'row', alignItems: 'center' },
  imagePreview: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#EEE' },
  pdfPreviewWrapper: { flexDirection: 'row', alignItems: 'center' },
  pdfIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#E14B4B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentMeta: { flex: 1, marginLeft: 12 },
  attachmentTitle: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  attachmentSub: { fontSize: 12, color: '#888', marginTop: 2 },
});
