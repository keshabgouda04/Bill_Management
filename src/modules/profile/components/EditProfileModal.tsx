import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUpdateProfileDetails } from '../../profile/api/profileApi';
import { UserProfile } from '../../../services/query/profile/profile';
import { DIMENSIONS, hp } from '../../../components/common';
import { validateName } from '../../../utils/validators';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  profile?: UserProfile;
}

export const EditProfileModal = ({ visible, onClose, profile }: EditProfileModalProps) => {
  const [editFullName, setEditFullName] = useState('');
  const [editCountry, setEditCountry]   = useState('');
  const [editLanguage, setEditLanguage] = useState('');
  const [editTimezone, setEditTimezone] = useState('');
  const [nameError, setNameError]       = useState<string | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const mutation = useUpdateProfileDetails();

  useEffect(() => {
    if (profile) {
      setEditFullName(profile.full_name || '');
      setEditCountry(profile.country || '');
      setEditLanguage(profile.language || '');
      setEditTimezone(profile.timezone || '');
      setNameError(null);
    }
  }, [profile]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleNameChange = (text: string) => {
    setEditFullName(text);
    if (!text.trim()) {
      setNameError(null);
      return;
    }
    const err = validateName(text, 'Full name', 40);
    setNameError(err);
  };

  const handleSaveEdit = () => {
    const trimmedName = editFullName.trim();
    
    if (trimmedName) {
      const err = validateName(trimmedName, 'Full name', 40);
      if (err) {
        setNameError(err);
        return;
      }
    }

    const payload: Record<string, string> = {};
    if (trimmedName) payload.full_name = trimmedName;
    if (editCountry.trim())  payload.country = editCountry.trim();
    if (editLanguage.trim()) payload.language = editLanguage.trim();
    if (editTimezone.trim()) payload.timezone = editTimezone.trim();

    if (Object.keys(payload).length === 0) {
      Alert.alert('No Changes', 'Please fill in at least one field.');
      return;
    }

    mutation.mutate(payload, {
      onSuccess: () => {
        onClose();
        Alert.alert('Success', 'Profile updated successfully!');
      },
      onError: (error: any) => {
        Alert.alert('Update Failed', error.message || 'Could not update profile.');
      },
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.dismissOverlay} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalSheet}
        >
          {/* Grab Handle */}
          <View style={styles.grabHandle} />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalClose}>
              <Ionicons name="close" size={22} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={isKeyboardVisible}
            contentContainerStyle={
              isKeyboardVisible
                ? { paddingBottom: hp(38), flexGrow: 1 }
                : { paddingBottom: hp(3) }
            }
          >
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Name</Text>
              <Text style={[styles.charCounter, editFullName.length > 40 && styles.charCounterError]}>
                {editFullName.length}/40
              </Text>
            </View>
            <TextInput
              style={[styles.fieldInput, nameError ? styles.fieldInputError : null]}
              placeholder="e.g. Keshab Gouda"
              placeholderTextColor="#BBB"
              value={editFullName}
              onChangeText={handleNameChange}
              maxLength={40}
            />
            {nameError ? <Text style={styles.inlineErrorText}>{nameError}</Text> : null}

            {/* <Text style={styles.fieldLabel}>Country</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="e.g. India"
              placeholderTextColor="#BBB"
              value={editCountry}
              onChangeText={setEditCountry}
            /> */}

            <Text style={[styles.fieldLabel, { marginBottom: 6}]}>Language</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="e.g. English"
              placeholderTextColor="#BBB"
              value={editLanguage}
              onChangeText={setEditLanguage}
            />

            {/* <Text style={styles.fieldLabel}>Timezone</Text> */}
            {/* <TextInput
              style={styles.fieldInput}
              placeholder="e.g. Asia/Kolkata"
              placeholderTextColor="#BBB"
              value={editTimezone}
              onChangeText={setEditTimezone}
            /> */}

            <TouchableOpacity
              style={[styles.saveBtn, mutation.isPending && styles.saveBtnDisabled]}
              onPress={handleSaveEdit}
              activeOpacity={0.85}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 30 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end',
  },
  dismissOverlay: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
  },
  modalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    maxHeight: '88%',
  },
  grabHandle: {
    width: 36, height: 5, borderRadius: 3,
    backgroundColor: '#E5E5EA', alignSelf: 'center', marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 4, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  modalClose: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F5F6FA', justifyContent: 'center', alignItems: 'center',
  },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#555' },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 6,
  },
  charCounter: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  charCounterError: {
    color: '#EF4444',
    fontWeight: '700',
  },
  fieldInput: {
    height: 50, borderWidth: 1.5, borderColor: '#E8E8E8',
    borderRadius: 12, paddingHorizontal: 14, fontSize: 15,
    color: '#1A1A1A', backgroundColor: '#FAFAFA',
  },
  fieldInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inlineErrorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '500',
  },
  phoneRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E8E8E8', borderRadius: 12,
    backgroundColor: '#FAFAFA', height: 50, overflow: 'hidden',
  },
  phonePrefix: {
    paddingHorizontal: 14, height: '100%', justifyContent: 'center',
    borderRightWidth: 1.5, borderRightColor: '#E8E8E8', backgroundColor: '#F0F2FF',
  },
  phonePrefixText: { fontSize: 15, fontWeight: '700', color: '#4B65E4' },
  phoneInput: { flex: 1, paddingHorizontal: 14, fontSize: 15, color: '#1A1A1A' },
  saveBtn: {
    marginTop: 24, backgroundColor: '#4B65E4', borderRadius: 14,
    height: 54, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#4B65E4', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },

});
