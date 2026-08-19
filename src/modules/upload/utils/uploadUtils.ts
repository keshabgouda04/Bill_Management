export const parseDateToISO = (dateStr: string): string | null => {
  if (!dateStr.trim()) return null;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS Month is 0-indexed
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      const date = new Date(year, month, day, 12, 0, 0);
      return date.toISOString();
    }
  }
  return null;
};

export const parseDateTextToDate = (dateStr: string): Date => {
  if (!dateStr.trim()) return new Date();
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  return new Date();
};

export const formatDateToDDMMYYYY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const getYesterday = (): Date => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};

export const sanitizePrice = (text: string): string => {
  return text.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
};

export { validateName, validateInvoiceNumber, checkCharLimit, hasEmoji, removeEmoji, sanitizeQuantity, validateQuantity, validateLiveField, updateFieldErrors, validateSerialNumber, validateEmail } from '../../../utils/validators';





