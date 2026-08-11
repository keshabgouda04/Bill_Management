export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  github?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  [key: string]: string | undefined;
}

export interface VisitingCard {
  id: string;
  user_id?: string;
  card_name: string;
  template_id: number; // 1 | 2 | 3 | 4 | 5
  full_name: string;
  job_title: string;
  company_name?: string;
  company_logo_url?: string;
  profile_photo_url?: string;
  mobile: string;
  alternate_mobile?: string;
  email: string;
  website?: string;
  bio?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  social_links?: SocialLinks;
  is_active?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateVisitingCardPayload {
  card_name: string;
  template_id: number;
  full_name: string;
  job_title: string;
  company_name?: string;
  company_logo_url?: string;
  profile_photo_url?: string;
  mobile: string;
  alternate_mobile?: string;
  email: string;
  website?: string;
  bio?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  social_links?: SocialLinks;
  is_active?: boolean;
  display_order?: number;
}

export type UpdateVisitingCardPayload = Partial<CreateVisitingCardPayload>;

export interface CardValidationError {
  field: string;
  message: string;
}

export function validateVisitingCardPayload(payload: Partial<CreateVisitingCardPayload>): CardValidationError[] {
  const errors: CardValidationError[] = [];

  // Required Fields
  if (!payload.card_name?.trim()) {
    errors.push({ field: 'card_name', message: 'Card name is required' });
  } else if (payload.card_name.length > 50) {
    errors.push({ field: 'card_name', message: 'Card name cannot exceed 50 characters' });
  }

  if (!payload.template_id || ![1, 2, 3, 4, 5].includes(payload.template_id)) {
    errors.push({ field: 'template_id', message: 'Template ID must be 1, 2, 3, 4, or 5' });
  }

  if (!payload.full_name?.trim()) {
    errors.push({ field: 'full_name', message: 'Full name is required' });
  } else if (payload.full_name.length > 100) {
    errors.push({ field: 'full_name', message: 'Full name cannot exceed 100 characters' });
  }

  if (!payload.job_title?.trim()) {
    errors.push({ field: 'job_title', message: 'Job title is required' });
  } else if (payload.job_title.length > 100) {
    errors.push({ field: 'job_title', message: 'Job title cannot exceed 100 characters' });
  }

  if (!payload.mobile?.trim()) {
    errors.push({ field: 'mobile', message: 'Mobile number is required' });
  } else if (payload.mobile.length > 20) {
    errors.push({ field: 'mobile', message: 'Mobile number cannot exceed 20 characters' });
  }

  if (!payload.email?.trim()) {
    errors.push({ field: 'email', message: 'Email address is required' });
  } else if (payload.email.length > 100) {
    errors.push({ field: 'email', message: 'Email cannot exceed 100 characters' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  // Length Restrictions for Optional Fields
  if (payload.company_name && payload.company_name.length > 150) {
    errors.push({ field: 'company_name', message: 'Company name cannot exceed 150 characters' });
  }

  if (payload.bio && payload.bio.length > 500) {
    errors.push({ field: 'bio', message: 'Bio cannot exceed 500 characters' });
  }

  if (payload.alternate_mobile && payload.alternate_mobile.length > 20) {
    errors.push({ field: 'alternate_mobile', message: 'Alternate mobile cannot exceed 20 characters' });
  }

  if (payload.street && payload.street.length > 200) {
    errors.push({ field: 'street', message: 'Street address cannot exceed 200 characters' });
  }

  if (payload.city && payload.city.length > 100) {
    errors.push({ field: 'city', message: 'City cannot exceed 100 characters' });
  }

  if (payload.state && payload.state.length > 100) {
    errors.push({ field: 'state', message: 'State cannot exceed 100 characters' });
  }

  if (payload.country && payload.country.length > 100) {
    errors.push({ field: 'country', message: 'Country cannot exceed 100 characters' });
  }

  if (payload.pincode && payload.pincode.length > 20) {
    errors.push({ field: 'pincode', message: 'Pincode cannot exceed 20 characters' });
  }

  // URL Validations
  const isValidUrl = (url?: string) => {
    if (!url || url.trim() === '') return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (payload.company_logo_url && !isValidUrl(payload.company_logo_url)) {
    errors.push({ field: 'company_logo_url', message: 'Company logo must be a valid URL' });
  }

  if (payload.profile_photo_url && !isValidUrl(payload.profile_photo_url)) {
    errors.push({ field: 'profile_photo_url', message: 'Profile photo must be a valid URL' });
  }

  if (payload.website && !isValidUrl(payload.website)) {
    errors.push({ field: 'website', message: 'Website must be a valid URL' });
  }

  if (payload.social_links) {
    Object.entries(payload.social_links).forEach(([key, val]) => {
      if (val && val.trim() !== '' && !isValidUrl(val)) {
        errors.push({ field: `social_links.${key}`, message: `${key} link must be a valid URL` });
      }
    });
  }

  return errors;
}
