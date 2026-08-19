import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES } from '../constants/categories';

interface CategorySelectorModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export const CategorySelectorModal = ({
  visible,
  onClose,
  selectedCategoryId,
  onSelectCategory,
}: CategorySelectorModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.iosModalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.dismissOverlay} />
        </TouchableWithoutFeedback>

        <View style={[styles.iosModalContainer, { maxHeight: '65%' }]}>
          <View style={styles.grabHandle} />

          <View style={styles.iosModalHeader}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 16 }}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categorySelectItem,
                    isSelected && styles.categorySelectItemActive,
                  ]}
                  onPress={() => {
                    onSelectCategory(cat.id);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.categorySelectText,
                      isSelected && styles.categorySelectTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={18} color="#4B65E4" style={{ marginLeft: 'auto' }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  iosModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  dismissOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  iosModalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 30,
  },
  grabHandle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E5EA',
    alignSelf: 'center',
    marginBottom: 8,
  },
  iosModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F6FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categorySelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
  },
  categorySelectItemActive: {
    borderColor: '#4B65E4',
    backgroundColor: '#EEF2FF',
  },
  categorySelectText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4B5563',
  },
  categorySelectTextActive: {
    fontWeight: '700',
    color: '#4B65E4',
  },
});
