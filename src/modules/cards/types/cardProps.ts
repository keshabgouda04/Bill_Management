import { SocialLinks } from './cardTypes';

export interface VisitingCardProps {
  name: string;
  designation: string;
  company: string;
  phone: string;
  email: string;
  website?: string;
  address?: string;
  profileImage?: string;
  logo?: string;
  backgroundColor?: string;
  templateId?: number;
  socialLinks?: SocialLinks;
  autoIntroPeek?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}
