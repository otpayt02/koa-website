export type PartnerRelationshipStatus = "unverified" | "verified";
export type PartnerLogoPermission = "unconfirmed" | "approved";
export type PartnerReviewStatus = "draft" | "pending_review" | "approved" | "rejected";

export interface PartnerRecord {
  id: string;
  name: string;
  relationshipStatus: PartnerRelationshipStatus;
  logoPath: string;
  logoSource: string;
  logoPermission: PartnerLogoPermission;
  url: string;
  reviewStatus: PartnerReviewStatus;
}

// Partner claims stay empty until local evidence proves both the relationship
// and the right to display the organization's logo.
export const partners: PartnerRecord[] = [];

export function isPublicPartner(partner: PartnerRecord) {
  return partner.relationshipStatus === "verified"
    && partner.logoPermission === "approved"
    && partner.reviewStatus === "approved";
}

export const publicPartners = partners.filter(isPublicPartner);
