import { api } from './axiosConfig';

// Fallback Cloudflare account hash if not provided in environment variables
const CLOUDFLARE_ACCOUNT_HASH = process.env.EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_HASH || 'default-hash';
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Converts a Cloudflare image ID into a public delivery URL.
 * Supports Cloudflare IDs, existing HTTP URLs, and legacy image paths.
 * 
 * @param idOrUrl Cloudflare image ID or URL
 * @returns Resolved public delivery URL
 */
export const getCloudnareImageUrl = (idOrUrl?: string | null): string => {
  if (!idOrUrl) return '';

  const trimmed = idOrUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Handle relative legacy paths
  if (trimmed.startsWith('/')) {
    const cleanBaseUrl = BASE_URL.replace(/\/$/, '');
    return `${cleanBaseUrl}${trimmed}`;
  }

  // Otherwise, treat as a Cloudflare image ID
  return `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_HASH}/${trimmed}/public`;
};

/**
 * Builds a secure backend download/view URL for PDFs.
 * 
 * @param pdfId Cloudflare PDF key/ID
 * @returns Secure backend download URL
 */
export const getCloudnarePdfUrl = (pdfId: string): string => {
  const cleanBaseUrl = BASE_URL.replace(/\/$/, '');
  const cleanPdfId = pdfId.trim();
  return `${cleanBaseUrl}/vendor/cloudflare/pdf/download-url?key=${cleanPdfId}&isDownload=false`;
};

/**
 * Extracts the Cloudflare PDF key/ID from stored values or URLs.
 * 
 * @param valueOrUrl Stored value or full URL
 * @returns Extracted Cloudflare PDF key
 */
export const getCloudflarePdfKey = (valueOrUrl?: string | null): string => {
  if (!valueOrUrl) return '';

  const trimmed = valueOrUrl.trim();
  if (trimmed.includes('key=')) {
    try {
      const match = trimmed.match(/[?&]key=([^&]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    } catch (e) {
      console.error('Failed to parse key from URL:', e);
    }
  }

  return trimmed;
};

/**
 * Calls the backend to resolve the final Cloudflare PDF download URL before displaying or downloading.
 * 
 * @param pdfId Cloudflare PDF key/ID
 * @returns Resolved download URL
 */
export const resolveCloudflarePdfUrl = async (pdfId: string): Promise<string> => {
  const cleanPdfId = pdfId.trim();
  const relativePath = `/vendor/cloudflare/pdf/download-url?key=${cleanPdfId}&isDownload=false`;

  try {
    const response = await api.get<{ url?: string; downloadURL?: string; data?: { url?: string } }>(relativePath);
    
    // Support various common JSON response structures
    const resolvedUrl = response?.url || response?.downloadURL || response?.data?.url;
    
    if (!resolvedUrl) {
      throw new Error('Failed to resolve secure URL from response.');
    }
    
    return resolvedUrl;
  } catch (error) {
    console.error('Error resolving Cloudflare PDF URL:', error);
    throw error;
  }
};
