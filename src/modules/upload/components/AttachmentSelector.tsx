import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AttachmentSelectorProps {
  selectedFile: {
    uri: string;
    name: string;
    type: string;
    size?: number;
  } | null;
  onSelectAttachment: () => void;
  onClearAttachment: () => void;
}

export const AttachmentSelector = ({
  selectedFile,
  onSelectAttachment,
  onClearAttachment,
}: AttachmentSelectorProps) => {
  return (
    <>
      <Text style={styles.fieldLabel}>Attachment (Optional)</Text>
      {selectedFile ? (
        <View style={styles.attachmentPreviewContainer}>
          <Ionicons
            name={selectedFile.type === 'application/pdf' ? 'document-text' : 'image'}
            size={24}
            color="#4B65E4"
          />
          <View style={styles.attachmentInfo}>
            <Text style={styles.attachmentName} numberOfLines={1}>
              {selectedFile.name}
            </Text>
            {selectedFile.size !== undefined && (
              <Text style={styles.attachmentSize}>
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={onClearAttachment}
            style={styles.removeAttachmentBtn}
          >
            <Ionicons name="trash-outline" size={20} color="#E14B4B" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.attachmentSelectBtn}
          onPress={onSelectAttachment}
          activeOpacity={0.7}
        >
          <Ionicons name="cloud-upload-outline" size={20} color="#4B65E4" />
          <Text style={styles.attachmentSelectBtnText}>Choose PDF or Image</Text>
        </TouchableOpacity>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 14 },
  attachmentSelectBtn: {
    height: 50,
    borderWidth: 1.5,
    borderColor: '#4B65E4',
    borderStyle: 'dashed',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EEF2FF',
    marginBottom: 20,
    marginTop: 6,
  },
  attachmentSelectBtnText: {
    fontSize: 14,
    color: '#4B65E4',
    fontWeight: '600',
  },
  attachmentPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    marginBottom: 20,
    marginTop: 6,
  },
  attachmentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  attachmentSize: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  removeAttachmentBtn: {
    padding: 8,
  },
});
