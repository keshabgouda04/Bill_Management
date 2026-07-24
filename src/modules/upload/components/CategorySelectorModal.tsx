import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
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
        <View style={[styles.iosModalContainer, { maxHeight: '65%' }]}>
          <View style={styles.iosModalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.iosModalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Category</Text>
            <View style={{ width: 60 }} />
          </View>
          <ScrollView contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 16 }}>
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
  iosModalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
  },
  iosModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  iosModalCancelText: {
    color: '#E14B4B',
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
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
