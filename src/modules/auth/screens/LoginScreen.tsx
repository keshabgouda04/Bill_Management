import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/AuthNavigator';
import { sendOtp, loginWithGoogle } from '../api/authApi';
import LoginButton from '../components/LoginButton';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

// Ensure the WebBrowser auth session resolves correctly
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }: Props) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Google OAuth Authentication
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Redirect URL for Expo Go
      const redirectUrl = Linking.createURL('auth-callback'); // expo://[IP_ADDRESS]/auth-callback
      console.log('Redirect URL:', redirectUrl);

      await loginWithGoogle(redirectUrl);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Google Login Failed', error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Send OTP code via Supabase + Twilio
  const handleSendOtp = async () => {
    const rawNumber = phoneNumber.replace(/[^0-9]/g, '');

    // Validate Indian phone number: exactly 10 digits and starts with 6, 7, 8, or 9
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    if (!indianPhoneRegex.test(rawNumber)) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit Indian phone number (starts with 6, 7, 8, or 9).');
      return;
    }

    setLoading(true);
    try {
      await sendOtp(`+91${rawNumber}`);

      // Navigate to OTPScreen, passing the raw number
      navigation.navigate('OTP', { phoneNumber: rawNumber });
    } catch (error: any) {
      Alert.alert('Error Sending OTP', error.message || 'Could not send SMS code.');
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
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Top Logo */}
            <Image
              source={require('../../../assets/images/logo.jpg')}
              style={styles.logo}
            />

            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Enter your phone number to continue
            </Text>

            {/* Phone Number Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Phone number</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#666" style={styles.phoneIcon} />
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={styles.input}
                  placeholder="12345 67890"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phoneNumber}
                  onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ''))}
                  editable={!loading}
                  autoFocus
                />
              </View>
            </View>

            {/* Primary Action Button */}
            <LoginButton
              title="Continue"
              onPress={handleSendOtp}
              loading={loading}
            />

            {/* OAuth Dividers & Buttons */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[styles.googleButton, loading && styles.disabledButton]}
              onPress={handleGoogleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>
          </ScrollView>
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
  inputWrapper: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
  countryCode: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    marginHorizontal: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 56,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  googleButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  disabledButton: {
    opacity: 0.6,
  }
});
