import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

interface OcrScannerOverlayProps {
  fileName: string;
  fileUri: string;
  fileType: string;
  progress: number;
  statusText: string;
}

export default function OcrScannerOverlay({
  fileName,
  fileUri,
  fileType,
  progress,
  statusText,
}: OcrScannerOverlayProps) {
  return (
    <SafeAreaView style={styles.scanningContainer}>
      <StatusBar style="light" />
      <View style={styles.scanningCard}>
        <Text style={styles.scanningTitle}>📄 Bill Scanning Analyzer</Text>
        <Text style={styles.scanningFileText}>Analyzing: {fileName}</Text>

        <View style={styles.laserSandbox}>
          {fileType.includes('image') ? (
            <Image source={{ uri: fileUri }} style={styles.laserImg} resizeMode="contain" />
          ) : (
            <View style={styles.pdfMockPreview}>
              <Ionicons name="document-text" size={80} color="#E14B4B" />
              <Text style={styles.pdfMockText}>PDF DOCUMENT</Text>
            </View>
          )}
          <View style={styles.laserBar} />
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>

        <View style={styles.scanningStatusRow}>
          <ActivityIndicator size="small" color="#4B65E4" style={{ marginRight: 10 }} />
          <Text style={styles.scanningStatusText}>{statusText}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  scanningContainer: { flex: 1, backgroundColor: '#0B0D19', justifyContent: 'center', alignItems: 'center' },
  scanningCard: { width: width * 0.88, backgroundColor: '#131627', borderRadius: 24, padding: 24, alignItems: 'center' },
  scanningTitle: { fontSize: 18, fontWeight: '700', color: '#FFF', marginBottom: 6 },
  scanningFileText: { fontSize: 12, color: '#8A91B4', marginBottom: 20, textAlign: 'center' },
  laserSandbox: {
    width: width * 0.7,
    height: 240,
    backgroundColor: '#1C1F37',
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2F3456',
    position: 'relative',
    marginBottom: 24,
  },
  laserImg: { width: '100%', height: '100%' },
  pdfMockPreview: { justifyContent: 'center', alignItems: 'center' },
  pdfMockText: { color: '#E14B4B', fontSize: 12, fontWeight: '700', marginTop: 8, letterSpacing: 1 },
  laserBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#4B65E4',
    shadowColor: '#4B65E4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
    top: '40%',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#2F3456',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: { height: '100%', backgroundColor: '#4B65E4' },
  scanningStatusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  scanningStatusText: { color: '#A5B4FC', fontSize: 13, fontWeight: '600' },
});
