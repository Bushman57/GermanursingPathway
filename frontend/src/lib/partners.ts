export type PartnerSchool = {
  slug: string;
  nameEn: string;
  nameDe: string;
  city: string;
  descriptionEn: string;
  descriptionDe: string;
  websiteUrl?: string;
  verified: boolean;
};

export const partnerSchools: PartnerSchool[] = [
  {
    slug: "berlin-nursing-institute",
    nameEn: "Berlin Nursing Institute",
    nameDe: "Berlin Pflegeinstitut",
    city: "Berlin",
    descriptionEn:
      "Accredited vocational nursing programs with strong hospital partnerships across Berlin and Brandenburg.",
    descriptionDe:
      "Akkreditierte Pflegeausbildung mit starken Klinikpartnerschaften in Berlin und Brandenburg.",
    verified: true,
  },
  {
    slug: "nrw-health-academy",
    nameEn: "NRW Health Academy",
    nameDe: "NRW Gesundheitsakademie",
    city: "Düsseldorf",
    descriptionEn:
      "Ausbildung and adaptation pathways for international nurses, with dedicated language support units.",
    descriptionDe:
      "Ausbildungs- und Anpassungswege für internationale Pflegekräfte mit eigener Sprachförderung.",
    verified: true,
  },
  {
    slug: "munich-care-college",
    nameEn: "Munich Care College",
    nameDe: "München Care College",
    city: "Munich",
    descriptionEn:
      "Scholarship-linked nursing placements in Bavaria with structured pre-departure onboarding.",
    descriptionDe:
      "Stipendienverknüpfte Pflegeplatzierungen in Bayern mit strukturiertem Pre-Departure-Onboarding.",
    verified: true,
  },
  {
    slug: "hamburg-clinical-school",
    nameEn: "Hamburg Clinical School",
    nameDe: "Hamburg Klinikschule",
    city: "Hamburg",
    descriptionEn:
      "Clinical training partnerships for Kenyan diploma and degree nurses entering the German system.",
    descriptionDe:
      "Klinische Ausbildungspartnerschaften für kenianische Diplom- und Bachelor-Pflegekräfte.",
    verified: true,
  },
];
