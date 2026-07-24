import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OTPInputProps {
  value: string;
  onChangeText: (text: string) => void;
  loading: boolean;
  onChangePhoneNumber: () => void;
}

export default function OTPInput({ value, onChangeText, loading, onChangePhoneNumber }: OTPInputProps) {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>Verification Code</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="shield-checkmark-outline" size={20} color="#666" style={styles.phoneIcon} />
        <TextInput
          style={styles.input}
          placeholder="123456"
          placeholderTextColor="#999"
          keyboardType="number-pad"
          maxLength={6}
          value={value}
          onChangeText={onChangeText}
          editable={!loading}
          autoFocus
        />
      </View>
      <TouchableOpacity
        onPress={onChangePhoneNumber}
        disabled={loading}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>Change phone number</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f5efefff',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#F9F9F9',
  },
  phoneIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  backButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#4B65E4',
    fontSize: 14,
    fontWeight: '600',
  },
});
