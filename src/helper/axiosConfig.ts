import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { supabase } from './supabase';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 20000, // 20 seconds
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// ------------------------
// Request Interceptor
// ------------------------
axiosInstance.interceptors.request.use(
  async (config) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const token = session?.access_token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ------------------------
// Response Interceptor
// ------------------------
axiosInstance.interceptors.response.use(
  (response) => {
    if (response.status === 204) {
      return null;
    }

    return response.data;
  },

  async (error: AxiosError<any>) => {
    // If backend says Unauthorized
    if (error.response?.status === 401) {
      // Clear Supabase session
      await supabase.auth.signOut();

      // Here you can also navigate to Login if needed
      // Example:
      // resetAndNavigate("Login");

      console.log('Session expired. Please login again.');
    }

    const errorData = error.response?.data as any;
    console.error('API Error Response:', errorData);

    let message = errorData?.message || error.message || `Request failed with status ${error.response?.status}`;
    
    // Append detailed validation errors if they exist (common in Python/FastAPI/Django/Laravel)
    if (errorData?.detail) {
      if (typeof errorData.detail === 'string') {
        message = `${message}: ${errorData.detail}`;
      } else if (Array.isArray(errorData.detail)) {
        // FastAPI style validation errors
        const details = errorData.detail.map((e: any) => `${e.loc?.join('.') || 'field'}: ${e.msg}`).join(', ');
        message = `${message} - ${details}`;
      }
    } else if (errorData?.errors) {
      message = `${message}: ${JSON.stringify(errorData.errors)}`;
    } else if (errorData?.error) {
      message = `${message}: ${JSON.stringify(errorData.error)}`;
    }

    return Promise.reject(new Error(message));
  }
);

export const api = {
  get: (path: string, options?: AxiosRequestConfig) =>
    axiosInstance.get(path, options),

  post: (path: string, body?: any, options?: AxiosRequestConfig) =>
    axiosInstance.post(path, body, options),

  put: (path: string, body?: any, options?: AxiosRequestConfig) =>
    axiosInstance.put(path, body, options),

  patch: (path: string, body?: any, options?: AxiosRequestConfig) =>
    axiosInstance.patch(path, body, options),

  delete: (path: string, options?: AxiosRequestConfig) =>
    axiosInstance.delete(path, options),
};