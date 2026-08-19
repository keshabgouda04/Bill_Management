/**
 * Common validation utility functions across the application.
 */

/**
 * Regex matching standard unicode emojis and pictographs.
 */
export const EMOJI_REGEX = /[\p{Extended_Pictographic}\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;

/**
 * Returns true if text contains any emoji.
 */
export const hasEmoji = (text: string): boolean => {
  if (!text) return false;
  return /[\p{Extended_Pictographic}\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(text);
};

/**
 * Removes all emojis from a string.
 */
export const removeEmoji = (text: string): string => {
  if (!text) return '';
  return text.replace(EMOJI_REGEX, '');
};

/**
 * Validates a name field (e.g. Store Name, Product Name, Family Name).
 * Rule:
 * - Must not be empty.
 * - Must not contain emojis.
 * - Must be at least 3 characters long.
 * - Must not exceed maxLength.
 * - First 3 characters must be letters (A-Z / a-z).
 */
export const validateName = (
  value: string,
  fieldName: string = 'Name',
  maxLength: number = 100
): string | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return `Please enter ${fieldName.toLowerCase()}.`;
  }
  if (hasEmoji(value)) {
    return `${fieldName} cannot contain emojis.`;
  }
  if (trimmed.length < 3) {
    return `${fieldName} must be at least 3 characters long.`;
  }
  if (trimmed.length > maxLength) {
    return `${fieldName} cannot exceed ${maxLength} characters.`;
  }
  if (!/^[A-Za-z]{3}/.test(trimmed)) {
    return `The first 3 characters of ${fieldName.toLowerCase()} must be letters.`;
  }
  return null;
};

/**
 * Validates an invoice / bill number field.
 */
export const validateInvoiceNumber = (
  value: string,
  maxLength: number = 25
): string | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Please enter invoice number.';
  }
  if (hasEmoji(value)) {
    return 'Invoice number cannot contain emojis.';
  }
  if (trimmed.length > maxLength) {
    return `Invoice number cannot exceed ${maxLength} characters.`;
  }
  return null;
};

/**
 * Checks if a string has reached or exceeded a character limit.
 * Returns an error message string if limit is reached/exceeded, or null if valid.
 */
export const checkCharLimit = (
  value: string,
  maxLength: number = 100,
  fieldName?: string
): string | null => {
  if (value && value.length >= maxLength) {
    return fieldName
      ? `${fieldName} reached maximum limit of ${maxLength} characters.`
      : `Maximum ${maxLength} characters reached.`;
  }
  return null;
};

/**
 * Real-time field validator checking for emojis and character limits.
 */
export const validateLiveField = (
  val: string,
  options?: {
    maxLength?: number;
    disallowEmoji?: boolean;
    requireAlphanumeric?: boolean;
    disallowDot?: boolean;
    label?: string;
  }
): string | null => {
  const label = options?.label || 'Field';
  if (options?.disallowEmoji && hasEmoji(val)) {
    return `${label} cannot contain emojis.`;
  }
  if (options?.disallowDot && val && val.includes('.')) {
    return `${label} cannot contain decimals or dots.`;
  }
  if (options?.requireAlphanumeric && val && val.trim() && !/[A-Za-z0-9]/.test(val)) {
    return `${label} cannot consist only of special characters.`;
  }
  if (options?.maxLength && val && val.length >= options.maxLength) {
    return `${label} reached maximum limit of ${options.maxLength} characters.`;
  }
  return null;
};

/**
 * Helper to update errors state map for real-time field validation.
 */
export const updateFieldErrors = (
  prevErrors: Record<string, string>,
  fieldKey: string,
  errorMsg: string | null
): Record<string, string> => {
  if (errorMsg) {
    return { ...prevErrors, [fieldKey]: errorMsg };
  }
  if (prevErrors[fieldKey] && (
    prevErrors[fieldKey].includes('reached') ||
    prevErrors[fieldKey].includes('emojis') ||
    prevErrors[fieldKey].includes('special characters') ||
    prevErrors[fieldKey].includes('decimals or dots')
  )) {
    const { [fieldKey]: _, ...rest } = prevErrors;
    return rest;
  }
  return prevErrors;
};

/**
 * Validates a serial number field.
 * Allows letters, numbers, spaces, and special characters (e.g. -, /, #, :, _).
 * Rejects emojis, dots/decimals, strings exceeding maxLength, and strings consisting ONLY of special characters.
 */
export const validateSerialNumber = (
  value: string,
  maxLength: number = 50
): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (hasEmoji(trimmed)) {
    return 'Serial number cannot contain emojis.';
  }
  if (trimmed.includes('.')) {
    return 'Serial number cannot contain decimals or dots.';
  }
  if (trimmed.length > maxLength) {
    return `Serial number cannot exceed ${maxLength} characters.`;
  }
  if (!/[A-Za-z0-9]/.test(trimmed)) {
    return 'Serial number cannot consist only of special characters.';
  }
  return null;
};

/**
 * Sanitizes quantity input to allow only whole positive integers (strips dots, decimals, symbols).
 */
export const sanitizeQuantity = (text: string): string => {
  if (!text) return '';
  return text.replace(/[^0-9]/g, '');
};

/**
 * Validates a quantity value.
 * Rule:
 * - Must be a valid positive whole number (> 0).
 * - No dots or decimals allowed.
 */
export const validateQuantity = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Please enter a valid quantity.';
  }
  if (trimmed.includes('.')) {
    return 'Quantity must be a whole number (no dots allowed).';
  }
  const parsed = Number(trimmed);
  if (isNaN(parsed) || parsed <= 0 || !Number.isInteger(parsed)) {
    return 'Please enter a valid whole number for quantity.';
  }
  return null;
};

/**
 * Standard Email Regex matching user@domain.tld structure.
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Validates whether a string is a properly formatted email address.
 * Returns null if valid, or an error message string if invalid.
 */
export const validateEmail = (email: string): string | null => {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Please enter an email address.';
  }
  if (hasEmoji(trimmed)) {
    return 'Email address cannot contain emojis.';
  }
  if (trimmed.length > 100) {
    return 'Email address cannot exceed 100 characters.';
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Please enter a valid email address (e.g. user@example.com).';
  }
  return null;
};

