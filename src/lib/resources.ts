export type ResourceArticle = {
  slug: string;
  titleEn: string;
  titleDe: string;
  excerptEn: string;
  excerptDe: string;
  category: "language" | "visa" | "story" | "guide";
  readMinutes: number;
};

export const resourceArticles: ResourceArticle[] = [
  {
    slug: "german-a1-a2-for-nurses",
    titleEn: "German A1–A2 for Nurses: Where to Start",
    titleDe: "Deutsch A1–A2 für Pflegekräfte: Der Einstieg",
    excerptEn:
      "A practical study plan for healthcare professionals beginning German — certificates, timelines, and what schools expect.",
    excerptDe:
      "Ein praktischer Lernplan für Gesundheitsfachkräfte — Zertifikate, Zeitpläne und Erwartungen der Schulen.",
    category: "language",
    readMinutes: 6,
  },
  {
    slug: "nursing-visa-germany-checklist",
    titleEn: "Nursing Visa for Germany: Document Checklist",
    titleDe: "Pflege-Visum für Deutschland: Dokumenten-Checkliste",
    excerptEn:
      "The core documents Kenyan nurses need before an embassy appointment — and how to avoid common delays.",
    excerptDe:
      "Die Kernunterlagen für kenianische Pflegekräfte vor dem Botschaftstermin — und typische Verzögerungen.",
    category: "visa",
    readMinutes: 8,
  },
  {
    slug: "ausbildung-vs-scholarship",
    titleEn: "Ausbildung vs. Scholarship: Which Path Fits You?",
    titleDe: "Ausbildung vs. Stipendium: Welcher Weg passt?",
    excerptEn:
      "Compare vocational apprenticeship routes and scholarship placements — eligibility, earnings, and timelines.",
    excerptDe:
      "Vergleich von Ausbildung und Stipendienplatzierungen — Voraussetzungen, Verdienst und Zeitrahmen.",
    category: "guide",
    readMinutes: 7,
  },
  {
    slug: "candidate-story-nairobi-to-berlin",
    titleEn: "Candidate Story: From Nairobi to Berlin",
    titleDe: "Kandidatengeschichte: Von Nairobi nach Berlin",
    excerptEn:
      "How one Kenyan CNA navigated language training, school matching, and her first months in a German hospital.",
    excerptDe:
      "Wie eine kenianische Pflegeassistentin Sprache, Schulmatching und die ersten Monate im Klinikalltag meisterte.",
    category: "story",
    readMinutes: 5,
  },
  {
    slug: "anmeldung-first-week",
    titleEn: "Anmeldung & First Week in Germany",
    titleDe: "Anmeldung & erste Woche in Deutschland",
    excerptEn:
      "Registration, insurance, banking, and transport — a newcomer checklist for healthcare workers.",
    excerptDe:
      "Anmeldung, Versicherung, Bank und Verkehr — eine Checkliste für neu angekommene Fachkräfte.",
    category: "guide",
    readMinutes: 6,
  },
];
