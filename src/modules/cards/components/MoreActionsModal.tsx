import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VisitingCardProps } from '../types/cardProps';

interface MoreActionsModalProps {
  visible: boolean;
  data: VisitingCardProps;
  onClose: () => void;
  onShowQR?: () => void;
}

export const MoreActionsModal: React.FC<MoreActionsModalProps> = ({
  visible,
  data,
  onClose,
  onShowQR,
}) => {
  const slideAnim = React.useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 30,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(300);
    }
  }, [visible]);

  if (!visible) return null;

  const handleQR = () => {
    onClose();
    setTimeout(() => {
      onShowQR?.();
    }, 150);
  };

  const handleEdit = () => {
    onClose();
    setTimeout(() => {
      data.onEdit?.();
    }, 150);
  };

  const handleDelete = () => {
    onClose();
    setTimeout(() => {
      data.onDelete?.();
    }, 150);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.sheet,
                {
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Drag Handle Bar */}
              <View style={styles.handleBar} />

              {/* Sheet Header */}
              <View style={styles.header}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitial}>
                    {data.name ? data.name.charAt(0).toUpperCase() : 'V'}
                  </Text>
                </View>
                <View style={styles.headerTextCol}>
                  <Text style={styles.cardName}>{data.name || 'Card Options'}</Text>
                  <Text style={styles.cardCompany}>
                    {data.designation ? `${data.designation} • ` : ''}{data.company || 'Business Card'}
                  </Text>
                </View>
              </View>

              {/* Actions List */}
              <View style={styles.actionList}>
                {/* Save vCard / QR */}
                <TouchableOpacity
                  style={styles.actionItem}
                  activeOpacity={0.7}
                  onPress={handleQR}
                >
                  <View style={[styles.iconBadge, { backgroundColor: '#ECFDF5' }]}>
                    <Ionicons name="qr-code" size={20} color="#10B981" />
                  </View>
                  <View style={styles.actionTextCol}>
                    <Text style={styles.actionTitle}>vCard & QR Code</Text>
                    <Text style={styles.actionSubtitle}>Show QR code to share or save contact</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                </TouchableOpacity>

                {/* Edit Card */}
                {data.onEdit && (
                  <TouchableOpacity
                    style={styles.actionItem}
                    activeOpacity={0.7}
                    onPress={handleEdit}
                  >
                    <View style={[styles.iconBadge, { backgroundColor: '#FEF3C7' }]}>
                      <Ionicons name="create-outline" size={20} color="#F59E0B" />
                    </View>
                    <View style={styles.actionTextCol}>
                      <Text style={styles.actionTitle}>Edit Card Details</Text>
                      <Text style={styles.actionSubtitle}>Update name, phone, email & theme</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                )}

                {/* Delete Card */}
                {data.onDelete && (
                  <TouchableOpacity
                    style={styles.actionItem}
                    activeOpacity={0.7}
                    onPress={handleDelete}
                  >
                    <View style={[styles.iconBadge, { backgroundColor: '#FEE2E2' }]}>
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </View>
                    <View style={styles.actionTextCol}>
                      <Text style={[styles.actionTitle, { color: '#EF4444' }]}>
                        Delete Visiting Card
                      </Text>
                      <Text style={styles.actionSubtitle}>Permanently remove this card</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.8}
                onPress={onClose}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4B65E4',
  },
  headerTextCol: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardCompany: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  actionList: {
    gap: 8,
    marginBottom: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTextCol: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
});
