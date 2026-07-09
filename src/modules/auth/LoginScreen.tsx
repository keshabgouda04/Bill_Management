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
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../../helper/supabase';

// Ensure the WebBrowser auth session resolves correctly
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Google OAuth Authentication via Supabase
  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      // Redirect URL for Expo Go
      const redirectUrl = Linking.createURL('auth-callback');//it generates a url base on the metro ip and port in use for ex : expo://[IP_ADDRESS]/auth-callback
      console.log('Redirect URL:', redirectUrl);

      // Start Google OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No OAuth URL returned from Supabase.');

      // Open Google login page
      const browserResult = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl
      );

      console.log('Browser Result:', browserResult);

      if (browserResult.type === 'success' && browserResult.url) {
        console.log('Returned URL:', browserResult.url);

        // Extract everything after '#'
        const fragment = browserResult.url.split('#')[1];

        if (!fragment) {
          throw new Error('No authentication data returned.');
        }

        console.log('Fragment:', fragment);

        // Convert fragment into key-value pairs
        const params = new URLSearchParams(fragment);

        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        console.log('Access Token:', access_token);
        console.log('Refresh Token:', refresh_token);

        if (!access_token || !refresh_token) {
          throw new Error('Access token or refresh token not found.');
        }

        // Save session inside expo store provided by expo
        const { error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (sessionError) throw sessionError;

        console.log('✅ Session saved successfully.');

        // Verify session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log('Current Session:', session);
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        'Google Login Failed',
        error.message || 'Something went wrong.'
      );
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

    const formattedPhone = `+91${rawNumber}`;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;
      setIsOtpSent(true);
    } catch (error: any) {
      Alert.alert('Error Sending OTP', error.message || 'Could not send SMS code.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Verify OTP code via Supabase
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit verification code.');
      return;
    }

    const rawNumber = phoneNumber.replace(/[^0-9]/g, '');
    const formattedPhone = `+91${rawNumber}`;

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otpCode.trim(),
        type: 'sms',
      });

      if (error) throw error;
      
      console.log('✅ OTP Verified successfully.');

    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'Incorrect or expired SMS code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Top Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="file-tray-stacked-outline" size={32} color="#FFFFFF" />
        </View>

        {/* Headings dynamically change depending on OTP step */}
        <Text style={styles.title}>
          {isOtpSent ? 'Verify Code' : 'Welcome back'}
        </Text>
        <Text style={styles.subtitle}>
          {isOtpSent
            ? `Enter the 6-digit code sent to +91 ${phoneNumber}`
            : 'Enter your phone number to continue'}
        </Text>

        {/* Dynamic Inputs (Phone Number OR OTP) */}
        {!isOtpSent ? (
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
        ) : (
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
                value={otpCode}
                onChangeText={setOtpCode}
                editable={!loading}
                autoFocus
              />
            </View>
            <TouchableOpacity
              onPress={() => setIsOtpSent(false)}
              disabled={loading}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>Change phone number</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Primary Action Button (Continue/Verify) */}
        <TouchableOpacity
          style={[styles.continueButton, loading && styles.disabledButton]}
          onPress={isOtpSent ? handleVerifyOtp : handleSendOtp}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.continueButtonText}>
              {isOtpSent ? 'Verify Code' : 'Continue'}
            </Text>
          )}
        </TouchableOpacity>

        {/* OAuth Dividers & Buttons - Only show on main phone login stage */}
        {!isOtpSent && (
          <>
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
          </>
        )}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#4B65E4',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
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
    color: '#1A1A1A',
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999999',
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
  backButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#4B65E4',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  }
});
