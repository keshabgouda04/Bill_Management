import type { BillDetail } from '../api/billsApi';
import { formatDate, formatTimeAgo } from '../../../utils/dateUtils';

export { formatDate, formatTimeAgo };

const PHOTO_FIELDS: Array<keyof BillDetail> = [
  'photo_url',
  'image_url',
  'receipt_url',
  'file_url',
  'document_url',
  'attachment_url',
  'original_file_url',
  'bill_image_url',
  'bill_photo_url',
];

export function formatAmount(amount?: number | string | null, currency = 'INR'): string {
  if (amount === undefined || amount === null || amount === '') return '-';

  const num = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return '-';

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return `${currency || 'INR'} ${num.toLocaleString('en-IN')}`;
  }
}

export function getPhotoUri(bill: BillDetail): string | null {
  for (const field of PHOTO_FIELDS) {
    const value = bill[field];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

export function getWarrantyDays(warrantyUntil?: string | null): number | null {
  if (!warrantyUntil) return null;

  const expiry = new Date(warrantyUntil).getTime();
  if (Number.isNaN(expiry)) return null;

  return Math.max(0, Math.ceil((expiry - Date.now()) / (1000 * 60 * 60 * 24)));
}
