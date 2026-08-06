import React from 'react';
import { VisitingCard as MasterVisitingCard } from './VisitingCard';
import { VisitingCard as VisitingCardType } from '../types/cardTypes';

interface ThreeDVisitingCardProps {
  card: VisitingCardType;
  onEdit?: (card: VisitingCardType) => void;
  onDelete?: (card: VisitingCardType) => void;
  onShowQR?: (card: VisitingCardType) => void;
  interactive?: boolean;
}

export function ThreeDVisitingCard({
  card,
  onEdit,
  onDelete,
  onShowQR,
}: ThreeDVisitingCardProps) {
  return (
    <MasterVisitingCard
      name={card.full_name || card.card_name}
      designation={card.job_title || 'Professional'}
      company={card.company_name || 'Business'}
      phone={card.mobile}
      email={card.email}
      website={card.website || undefined}
      address={[card.street, card.city, card.state, card.country].filter(Boolean).join(', ') || undefined}
      profileImage={card.profile_photo_url || undefined}
      logo={card.company_logo_url || undefined}
      templateId={card.template_id || 1}
      onEdit={() => onEdit?.(card)}
      onDelete={() => onDelete?.(card)}
      onShowQR={() => onShowQR?.(card)}
    />
  );
}

export { MasterVisitingCard as VisitingCardComponent };
