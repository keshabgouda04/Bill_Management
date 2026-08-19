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

export function formatAmount(amount?: number, currency = 'INR'): string {
  if (typeof amount !== 'number') return '-';

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString('en-IN')}`;
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
