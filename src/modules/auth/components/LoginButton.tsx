import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface LoginButtonProps {
  title: string;
  onPress: () => void;
  loading: boolean;
}

export default function LoginButton({ title, onPress, loading }: LoginButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.continueButton, loading && styles.disabledButton]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text style={styles.continueButtonText}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  continueButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#4B65E4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
