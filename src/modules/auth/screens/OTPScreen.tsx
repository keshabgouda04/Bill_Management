import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/AuthNavigator';
import { verifyOtp } from '../api/authApi';
import OTPInput from '../components/OTPInput';
import LoginButton from '../components/LoginButton';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<AuthStackParamList, 'OTP'>;

export default function OTPScreen({ navigation, route }: Props) {
  const { phoneNumber } = route.params;
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Verify OTP code via Supabase
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(`+91${phoneNumber}`, otpCode.trim());

      console.log('✅ OTP Verified successfully.');
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'Incorrect or expired SMS code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#243B6E', '#1C2B52', '#162547']}
      locations={[0, 0.45, 1]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Top Logo */}
          <Image
            source={require('../../../assets/images/logo.jpg')}
            style={styles.logo}
          />

          <Text style={styles.title}>Verify Code</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to +91 {phoneNumber}
          </Text>

          <OTPInput
            value={otpCode}
            onChangeText={setOtpCode}
            loading={loading}
            onChangePhoneNumber={() => navigation.goBack()}
          />

          <LoginButton
            title="Verify Code"
            onPress={handleVerifyOtp}
            loading={loading}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 40,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
});
