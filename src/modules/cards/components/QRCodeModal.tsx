import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Share,
  Clipboard,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VisitingCard } from '../types/cardTypes';

interface QRCodeModalProps {
  visible: boolean;
  card: VisitingCard | null;
  onClose: () => void;
}

export function QRCodeModal({ visible, card, onClose }: QRCodeModalProps) {
  if (!card) return null;

  // Generate vCard format text string
  const vCardString = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${card.full_name};;;;`,
    `FN:${card.full_name}`,
    card.company_name ? `ORG:${card.company_name}` : '',
    card.job_title ? `TITLE:${card.job_title}` : '',
    `TEL;TYPE=CELL:${card.mobile}`,
    card.alternate_mobile ? `TEL;TYPE=WORK:${card.alternate_mobile}` : '',
    `EMAIL:${card.email}`,
    card.website ? `URL:${card.website}` : '',
    card.bio ? `NOTE:${card.bio}` : '',
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\n');

  const handleCopyVCard = () => {
    Clipboard.setString(vCardString);
    Alert.alert('Success', 'vCard contact data copied to clipboard!');
  };

  const handleShareCard = async () => {
    try {
      await Share.share({
        title: `${card.full_name} - Visiting Card`,
        message: `Contact details for ${card.full_name} (${card.job_title} at ${card.company_name || 'N/A'}):\n\nMobile: ${card.mobile}\nEmail: ${card.email}\nWebsite: ${card.website || 'N/A'}`,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color="#64748B" />
          </TouchableOpacity>

          <View style={styles.headerBox}>
            <Ionicons name="qr-code-outline" size={32} color="#4B65E4" />
            <Text style={styles.modalTitle}>Digital vCard</Text>
            <Text style={styles.modalSubtitle}>{card.full_name} • {card.card_name}</Text>
          </View>

          {/* Visual QR Code Placeholder Frame */}
          <View style={styles.qrFrame}>
            <View style={styles.qrInnerBox}>
              <Ionicons name="qr-code" size={160} color="#1E293B" />
            </View>
            <Text style={styles.qrHint}>Scan to save contact directly to Phone Book</Text>
          </View>

          <View style={styles.vcardPreviewBox}>
            <Text style={styles.vcardLabel}>vCard Contact Summary:</Text>
            <Text style={styles.vcardPreviewText} numberOfLines={4}>
              {vCardString}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopyVCard}>
              <Ionicons name="copy-outline" size={18} color="#4B65E4" />
              <Text style={styles.copyBtnText}>Copy vCard</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareBtn} onPress={handleShareCard}>
              <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
              <Text style={styles.shareBtnText}>Share vCard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  qrFrame: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    width: '100%',
  },
  qrInnerBox: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  qrHint: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 10,
    fontWeight: '500',
  },
  vcardPreviewBox: {
    width: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
  },
  vcardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  vcardPreviewText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#334155',
    lineHeight: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  copyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#4B65E4',
    backgroundColor: '#F0F3FF',
  },
  copyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B65E4',
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#4B65E4',
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
