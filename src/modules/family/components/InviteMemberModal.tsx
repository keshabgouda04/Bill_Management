import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInviteMember, FamilyRole } from '../api/familyApi';

import { validateEmail } from '../../../utils/validators';

interface InviteMemberModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function InviteMemberModal({ visible, onClose }: InviteMemberModalProps) {
  const [email, setEmailState] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [role, setRole] = useState<FamilyRole>('MEMBER');
  
  const inviteMutation = useInviteMember();

  const handleEmailChange = (val: string) => {
    setEmailState(val);
    if (emailError) {
      setEmailError(null);
    }
  };

  const handleInvite = () => {
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }

    inviteMutation.mutate({ email: email.trim().toLowerCase(), role }, {
      onSuccess: () => {
        Alert.alert('Success', 'Invitation sent successfully!');
        setEmailState('');
        setEmailError(null);
        setRole('MEMBER');
        onClose();
      },
      onError: (error: any) => {
        const msg = error?.response?.data?.message || 'Failed to send invitation.';
        Alert.alert('Error', msg);
      }
    });
  };

  const handleClose = () => {
    setEmailState('');
    setEmailError(null);
    setRole('MEMBER');
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Invite Member</Text>
          <Text style={styles.subtitle}>Enter an email to invite someone to this family vault.</Text>
          
          <View style={[styles.inputContainer, emailError ? { borderColor: '#EF4444' } : null]}>
            <Ionicons name="mail-outline" size={20} color={emailError ? '#EF4444' : '#888'} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#999"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {emailError && (
            <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: '500', marginTop: -14, marginBottom: 14 }}>
              {emailError}
            </Text>
          )}

          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>Role</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity 
                style={[styles.roleBtn, role === 'ADMIN' && styles.roleBtnActive]}
                onPress={() => setRole('ADMIN')}
              >
                <Text style={[styles.roleBtnText, role === 'ADMIN' && styles.roleBtnTextActive]}>Admin</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.roleBtn, role === 'MEMBER' && styles.roleBtnActive]}
                onPress={() => setRole('MEMBER')}
              >
                <Text style={[styles.roleBtnText, role === 'MEMBER' && styles.roleBtnTextActive]}>Member</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.inviteBtn, inviteMutation.isPending && styles.inviteBtnDisabled]} 
              onPress={handleInvite}
              disabled={inviteMutation.isPending}
            >
              {inviteMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.inviteBtnText}>Send Invite</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  container: { width: '90%', backgroundColor: '#FFF', borderRadius: 16, padding: 24 },
  title: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F7FA',
    borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#EAEAEA', marginBottom: 20,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 48, fontSize: 16, color: '#1A1A1A' },
  roleContainer: { marginBottom: 24 },
  roleLabel: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 8 },
  roleButtons: { flexDirection: 'row', gap: 8 },
  roleBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#F5F7FA',
    alignItems: 'center', borderWidth: 1, borderColor: '#EAEAEA'
  },
  roleBtnActive: { backgroundColor: '#EEF2FF', borderColor: '#4B65E4' },
  roleBtnText: { fontSize: 13, fontWeight: '600', color: '#666' },
  roleBtnTextActive: { color: '#4B65E4' },
  actions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, backgroundColor: '#F5F7FA', borderRadius: 10, alignItems: 'center' },
  cancelBtnText: { fontWeight: '600', color: '#1A1A1A', fontSize: 15 },
  inviteBtn: { flex: 1, paddingVertical: 14, backgroundColor: '#4B65E4', borderRadius: 10, alignItems: 'center' },
  inviteBtnDisabled: { opacity: 0.7 },
  inviteBtnText: { fontWeight: '600', color: '#FFF', fontSize: 15 },
});
