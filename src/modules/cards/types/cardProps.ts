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
  onEdit?: () => void;
  onDelete?: () => void;
}
