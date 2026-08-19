import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { FamilyRole, useChangeRole } from '../api/familyApi';

interface UpdateRoleModalProps {
  visible: boolean;
  onClose: () => void;
  memberId: string;
  memberName: string;
  currentRole: FamilyRole;
}

export default function UpdateRoleModal({
  visible,
  onClose,
  memberId,
  memberName,
  currentRole,
}: UpdateRoleModalProps) {
  const [role, setRole] = useState<FamilyRole>(currentRole);
  const changeRoleMutation = useChangeRole();

  useEffect(() => {
    if (visible) {
      setRole(currentRole);
    }
  }, [visible, currentRole]);

  const handleUpdate = () => {
    if (role === currentRole) {
      onClose();
      return;
    }

    changeRoleMutation.mutate({ memberId, role }, {
      onSuccess: () => {
        Alert.alert('Success', `Role updated to ${role} for ${memberName}`);
        onClose();
      },
      onError: (error: any) => {
        const msg = error?.response?.data?.message || 'Failed to update role.';
        Alert.alert('Error', msg);
      }
    });
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Update Role</Text>
          <Text style={styles.subtitle}>Update the role for {memberName}</Text>
          
          <View style={styles.roleContainer}>
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
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.updateBtn, changeRoleMutation.isPending && styles.updateBtnDisabled]} 
              onPress={handleUpdate}
              disabled={changeRoleMutation.isPending}
            >
              {changeRoleMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.updateBtnText}>Save</Text>
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
  roleContainer: { marginBottom: 24 },
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
  updateBtn: { flex: 1, paddingVertical: 14, backgroundColor: '#4B65E4', borderRadius: 10, alignItems: 'center' },
  updateBtnDisabled: { opacity: 0.7 },
  updateBtnText: { fontWeight: '600', color: '#FFF', fontSize: 15 },
});
