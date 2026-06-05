import {
  Compass,
  Languages,
  FileText,
  ScrollText,
  Plane,
  Briefcase,
  Wallet,
  Home,
  AlertTriangle,
  Clock,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";

export type LearningTopic = {
  title: string;
  slug?: string; // optional link to a resource article
  video?: string; // YouTube URL or embed src
};

export type LearningModule = {
  id: string;
  emoji: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string; // tailwind gradient classes
  topics: LearningTopic[];
};

export const learningModules: LearningModule[] = [
  {
    id: "getting-started",
    emoji: "🧭",
    icon: Compass,
    title: "Getting Started",
    description: "Orient yourself: who qualifies, the roadmap, and the big choices.",
    accent: "from-sky-500/20 to-cyan-500/10",
    topics: [
      { title: "Overview of the Germany nursing pathway" },
      { title: "Step-by-step roadmap (Kenya → Germany)" },
      { title: "Who qualifies to apply (eligibility criteria)" },
      { title: "Differences between Ausbildung vs direct employment" },
    ],
  },
  {
    id: "german-language",
    emoji: "🗣️",
    icon: Languages,
    title: "German Language Learning",
    description: "Reach B1/B2 with the right exam, school, and study plan.",
    accent: "from-amber-500/20 to-orange-500/10",
    topics: [
      { title: "Required language levels (A1–B2 explained)" },
      { title: "Comparison of Goethe-Zertifikat vs TELC" },
      { title: "Best places to learn German in Kenya" },
      { title: "Study strategies for busy nurses" },
      { title: "Cost of learning German in Kenya" },
      { title: "How long it takes to reach B2" },
    ],
  },
  {
    id: "documents-applications",
    emoji: "📄",
    icon: FileText,
    title: "Documents & Applications",
    description: "Build a German-standard application file that recruiters trust.",
    accent: "from-emerald-500/20 to-teal-500/10",
    topics: [
      { title: "Required documents for Kenyan nurses" },
      { title: "How to prepare a German-style CV (Lebenslauf)" },
      { title: "Writing a motivation letter" },
      { title: "Document translation and certification" },
      { title: "Police clearance and passport process" },
    ],
  },
  {
    id: "recognition",
    emoji: "⚖️",
    icon: ScrollText,
    title: "Qualification Recognition (Anerkennung)",
    description: "Navigate Anabin, partial vs full recognition, and the adaptation period.",
    accent: "from-violet-500/20 to-purple-500/10",
    topics: [
      { title: "What recognition means in Germany" },
      { title: "Partial vs full recognition explained" },
      { title: "Required documents for recognition" },
      { title: "Adaptation period (Anpassungslehrgang)" },
      { title: "Role of Anabin" },
    ],
  },
  {
    id: "visa-immigration",
    emoji: "🛂",
    icon: Plane,
    title: "Visa & Immigration Process",
    description: "From the Nairobi embassy appointment to a successful visa stamp.",
    accent: "from-blue-500/20 to-indigo-500/10",
    topics: [
      { title: "Types of visas for nurses" },
      { title: "Application process via German Embassy Nairobi" },
      { title: "Visa interview preparation" },
      { title: "Required financial proof" },
      { title: "Common visa rejection reasons" },
    ],
  },
  {
    id: "jobs-recruitment",
    emoji: "💼",
    icon: Briefcase,
    title: "Jobs & Recruitment",
    description: "Find ethical employers, fair contracts, and competitive salaries.",
    accent: "from-rose-500/20 to-pink-500/10",
    topics: [
      { title: "Where to find nursing jobs in Germany" },
      { title: "Understanding job contracts" },
      { title: "Salary expectations for nurses" },
      { title: "Ethical recruitment programs like Triple Win" },
      { title: "How to identify and avoid fake agents" },
    ],
  },
  {
    id: "costs-financial",
    emoji: "💰",
    icon: Wallet,
    title: "Costs & Financial Planning",
    description: "Plan every euro from language fees to your first month abroad.",
    accent: "from-yellow-500/20 to-amber-500/10",
    topics: [
      { title: "Total cost breakdown (Kenya → Germany)" },
      { title: "Language school and exam fees" },
      { title: "Visa and relocation costs" },
      { title: "Cost of living in Germany (rent, food, transport)" },
      { title: "Financial planning tips before departure" },
    ],
  },
  {
    id: "life-in-germany",
    emoji: "🏠",
    icon: Home,
    title: "Life in Germany",
    description: "Settle in confidently: housing, insurance, and daily culture.",
    accent: "from-green-500/20 to-emerald-500/10",
    topics: [
      { title: "Accommodation and housing tips" },
      { title: "Cultural differences (workplace & daily life)" },
      { title: "Health insurance system" },
      { title: "Transportation and daily living" },
      { title: "Rights and responsibilities as a nurse" },
    ],
  },
  {
    id: "mistakes-scams",
    emoji: "⚠️",
    icon: AlertTriangle,
    title: "Mistakes & Scams to Avoid",
    description: "Spot red flags before they cost you time, money, or your visa.",
    accent: "from-red-500/20 to-orange-500/10",
    topics: [
      { title: "Common mistakes Kenyan applicants make" },
      { title: "Red flags when dealing with agents" },
      { title: "Contract traps and exploitation risks" },
      { title: "Misunderstanding language requirements" },
    ],
  },
  {
    id: "timelines-stories",
    emoji: "📊",
    icon: Clock,
    title: "Timelines & Real Experiences",
    description: "Realistic timeframes and stories from nurses already in Germany.",
    accent: "from-cyan-500/20 to-blue-500/10",
    topics: [
      { title: "Typical timeline (start to relocation)" },
      { title: "Real stories of Kenyan nurses in Germany" },
      { title: "Case studies (successful vs delayed journeys)" },
    ],
  },
  {
    id: "extra-support",
    emoji: "🧠",
    icon: LifeBuoy,
    title: "Extra Support Resources",
    description: "Templates, glossaries, and trusted external platforms.",
    accent: "from-fuchsia-500/20 to-purple-500/10",
    topics: [
      { title: "FAQs (frequently asked questions)" },
      { title: "Downloadable templates (CV, cover letter)" },
      { title: "Checklist before applying" },
      { title: "Glossary of German terms (Anerkennung, Ausbildung, etc.)" },
      { title: "Useful platforms: Make it in Germany & Federal Employment Agency" },
    ],
  },
];
