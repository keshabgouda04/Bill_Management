import { supabase } from '../../../helper/supabase';
import * as WebBrowser from 'expo-web-browser';

// 1. Send OTP to a phone number via Supabase + Twilio
export const sendOtp = async (formattedPhone: string): Promise<void> => {
  const { error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
  });
  if (error) throw error;
};

// 2. Verify OTP token for a given phone number
export const verifyOtp = async (formattedPhone: string, token: string): Promise<void> => {
  const { error } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token,
    type: 'sms',
  });
  if (error) throw error;
};

// 3. Start Google OAuth login flow and set the session
export const loginWithGoogle = async (redirectUrl: string): Promise<void> => {
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

  // Open Google login page in a browser
  const browserResult = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

  if (browserResult.type === 'success' && browserResult.url) {
    // Extract tokens from URL fragment (everything after '#')
    const fragment = browserResult.url.split('#')[1];
    if (!fragment) throw new Error('No authentication data returned.');

    const params = new URLSearchParams(fragment);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    console.log(access_token,"Access Token=====>")

    if (!access_token || !refresh_token) {
      throw new Error('Access token or refresh token not found.');
    }

    // Save session
    const { error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    
    if (sessionError) throw sessionError;

    // Verify session was saved correctly
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log('✅ Google session saved successfully.');
    console.log('Current Session:', session);
  }
};
