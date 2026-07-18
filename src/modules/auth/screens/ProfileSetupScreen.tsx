import React, { useState, useEffect } from 'react';
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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/AppNavigator';
import { supabase } from '../../../helper/supabase';
import { useGetProfileDetails } from '../../../services/query/profile/profile';
import { useUpdateProfileDetails } from '../../../services/mutation/profile/profileSetup';
import SplashScreen from './SplashScreen';

type Props = NativeStackScreenProps<AppStackParamList, 'ProfileSetup'>;

export default function ProfileSetupScreen({ navigation }: Props) {
  const { data } = useGetProfileDetails();
  const profile = data?.profile;
  const [showSplash, setShowSplash] = useState(false);

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [gender, setGender] = useState(profile?.gender || '');
  const [showGenderSelect, setShowGenderSelect] = useState(false);

  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name);
    if (profile?.phone) setPhoneNumber(profile.phone);
    if (profile?.email) setEmail(profile.email);
    if (profile?.gender) setGender(profile.gender);
  }, [profile]);

  const mutation = useUpdateProfileDetails();

  const handleCompleteSetup = () => {
    const isGoogleAuth = profile?.provider === 'google';

    if (!fullName.trim() || !gender) {
      Alert.alert('Required Fields', 'Please enter your full name and select a gender.');
      return;
    }

    // Validate Full Name: at least 2 characters and only letters/spaces
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    if (!nameRegex.test(fullName.trim())) {
      Alert.alert('Invalid Name', 'Full name must be at least 2 characters and contain only letters.');
      return;
    }

    if (isGoogleAuth && !phoneNumber.trim()) {
      Alert.alert('Required Fields', 'Please enter your phone number.');
      return;
    }

    if (isGoogleAuth) {
      const rawNumber = phoneNumber.replace(/[^0-9]/g, '');
      const indianPhoneRegex = /^[6-9]\d{9}$/;
      if (!indianPhoneRegex.test(rawNumber)) {
        Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit Indian phone number.');
        return;
      }
    }

    if (!isGoogleAuth && !email.trim()) {
      Alert.alert('Required Fields', 'Please enter your email address.');
      return;
    }

    if (!isGoogleAuth) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
        return;
      }
    }

    const payload: any = { full_name: fullName.trim(), gender: gender };
    if (isGoogleAuth) {
      payload.phone = phoneNumber.trim();
    } else {
      payload.email = email.trim();
    }

    mutation.mutate(
      payload,
      {
        onSuccess: () => {
          setShowSplash(true);
          setTimeout(() => {
            navigation.replace('Dashboard');
          }, 4000);
        },
        onError: (error: any) => {
          Alert.alert('Update Failed', error.message || 'Could not update profile. Please try again.');
        }
      }
    );
  };

  const handleBackToLogin = async () => {
    await supabase.auth.signOut();
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Background Pattern / Color */}
      <View style={styles.background} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="shield-checkmark" size={24} color="#0052CC" />
            <Text style={styles.logoText}>BillVault</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="help-circle-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Main Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Create your profile</Text>
          <Text style={styles.subtitle}>
            Set up your vault identity for secure{'\n'}financial management.
          </Text>

          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person-outline" size={32} color="#666" />
            </View>
            <TouchableOpacity style={styles.editIconContainer}>
              <Ionicons name="pencil" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Full Name Input */}
          <View style={[styles.inputWrapper, { zIndex: 2 }]}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Email / Phone Number Input */}
          {profile?.provider === 'google' ? (
            <View style={[styles.inputWrapper, { zIndex: 1 }]}>
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#999"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>
          ) : (
            <View style={[styles.inputWrapper, { zIndex: 1 }]}>
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}

          {/* Gender Select */}
          <View style={[styles.inputWrapper, { zIndex: 10 }]}>
            <Text style={styles.inputLabel}>Gender</Text>
            <TouchableOpacity
              style={styles.selectContainer}
              onPress={() => setShowGenderSelect(!showGenderSelect)}
              activeOpacity={0.8}
            >
              <Text style={[styles.selectText, !gender && { color: '#999' }]}>
                {gender === 'male' ? 'Male' :
                  gender === 'female' ? 'Female' :
                    gender === 'other' ? 'Other' :
                      gender === 'prefer_not_to_say' ? 'Prefer not to say' :
                        'Select Gender'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            {showGenderSelect && (
              <View style={styles.dropdown}>
                {[
                  { label: 'Male', value: 'male' },
                  { label: 'Female', value: 'female' },
                  { label: 'Other', value: 'other' },
                  { label: 'Prefer not to say', value: 'prefer_not_to_say' }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.dropdownOption}
                    onPress={() => {
                      setGender(option.value);
                      setShowGenderSelect(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownOptionText,
                      gender === option.value && styles.dropdownItemSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Complete Setup Button */}
          <TouchableOpacity
            style={[styles.button, mutation.isPending && styles.buttonDisabled]}
            onPress={handleCompleteSetup}
            activeOpacity={0.8}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.buttonText}>Complete Setup</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Back to Login */}
        <TouchableOpacity
          style={styles.backToLoginButton}
          onPress={handleBackToLogin}
        >
          <Ionicons name="arrow-back" size={16} color="#0052CC" />
          <Text style={styles.backToLoginText}>Back to Log in</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footerText}>
          © {new Date().getFullYear()} BillVault Security. All financial data is{'\n'}encrypted.
        </Text>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA', // Match the light blue-ish grey from the image
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F5F7FA',
    // In a real app we could add the dotted pattern here
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0052CC',
    marginLeft: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0052CC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 20,
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#1A1A1A',
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  selectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  selectText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  dropdown: {
    position: 'absolute',
    top: 76, // below the input + label height
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  dropdownItemSelected: {
    fontWeight: 'bold',
    color: '#0052CC',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  button: {
    flexDirection: 'row',
    width: '100%',
    height: 48,
    backgroundColor: '#0052CC',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  backToLoginButton: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    elevation: 1,
  },
  backToLoginText: {
    fontSize: 14,
    color: '#0052CC',
    fontWeight: '600',
    marginLeft: 6,
  },
  footerText: {
    marginTop: 32,
    textAlign: 'center',
    fontSize: 12,
    color: '#888',
    lineHeight: 18,
  }
});
