export type Scholarship = {
  slug: string;
  title: string;
  provider: string;
  degreeLevel: string;
  funding: string;
  deadline: string;
  location: string;
  shortDescription: string;
  about: string;
  hostCountry: string;
  studyIn: string;
  category: string;
  eligibleCountries: string;
  benefits: string[];
  eligibility: string[];
  requiredDocuments: string[];
  applicationProcess: string[];
  officialLink: string;
};

export const scholarships: Scholarship[] = [
  {
    slug: "german-bundestag-ips-africa-2027",
    title: "German Bundestag IPS Africa Scholarship 2027",
    provider: "German Bundestag",
    degreeLevel: "Internship Program",
    funding: "Fully Funded",
    deadline: "7 May 2026",
    location: "Berlin, Germany",
    shortDescription:
      "Five-month fully funded internship at the German Bundestag in Berlin for African graduates interested in politics and parliamentary work.",
    about:
      "The German Bundestag, in cooperation with Humboldt University of Berlin, Free University of Berlin, and Technical University of Berlin, offers the International Parliamentary Scholarship (IPS) for Africa. The program gives young, politically interested university graduates from selected African countries the opportunity to gain insight into the German parliamentary system and political decision-making processes by working alongside a Member of the Bundestag for five months.",
    hostCountry: "Germany",
    studyIn: "Berlin",
    category: "Internship / Fellowship",
    eligibleCountries: "Selected African countries (including Kenya)",
    benefits: [
      "Monthly scholarship of €500",
      "Free accommodation in Berlin",
      "Health, accident and liability insurance",
      "Travel expenses to and from Germany covered",
      "Visa fee covered",
      "5-month placement with a Member of the Bundestag",
      "Academic enrichment program at three Berlin universities",
    ],
    eligibility: [
      "Citizen of an eligible African country (Kenya included)",
      "Hold a university degree at the start of the scholarship",
      "Excellent knowledge of the German language (at least B2)",
      "Basic knowledge of German history and political system",
      "Under 30 years of age at the start of the program",
      "Strong interest in politics and willingness to engage",
    ],
    requiredDocuments: [
      "Completed application form",
      "Curriculum vitae (CV)",
      "Two letters of recommendation",
      "Certified copies of degree and transcripts",
      "Proof of German language proficiency (B2 or higher)",
      "Motivation letter",
      "Copy of passport",
    ],
    applicationProcess: [
      "Visit the official German Embassy / Bundestag IPS page for your country",
      "Download and complete the official application form",
      "Prepare all required documents in German",
      "Submit your full application package to the German Embassy in your country",
      "Shortlisted candidates are invited for an interview",
      "Selected scholars travel to Berlin for the 5-month program (Mar–Jul)",
    ],
    officialLink: "https://www.bundestag.de/ips",
  },
  {
    slug: "daad-epos-masters-2026",
    title: "DAAD EPOS Master's Scholarship 2026/2027",
    provider: "DAAD",
    degreeLevel: "Masters",
    funding: "Fully Funded",
    deadline: "31 October 2026",
    location: "Various German Universities",
    shortDescription:
      "DAAD Development-Related Postgraduate Courses (EPOS) for professionals from developing countries.",
    about:
      "The DAAD EPOS program offers fully funded postgraduate scholarships to qualified professionals from developing countries to pursue Master's degrees at top German universities in development-relevant fields.",
    hostCountry: "Germany",
    studyIn: "Multiple German Universities",
    category: "Masters / PhD",
    eligibleCountries: "Developing countries (Kenya included)",
    benefits: [
      "Monthly stipend of €934",
      "Travel allowance",
      "Health, accident and personal liability insurance",
      "Tuition fees covered",
      "Study and research allowance",
      "Rent subsidy and family allowance (where applicable)",
    ],
    eligibility: [
      "Bachelor's degree (4 years) in a relevant field",
      "Minimum 2 years of professional work experience",
      "Citizen of a developing country",
      "Degree completed not more than 6 years ago",
      "Language proficiency: English (IELTS/TOEFL) or German",
    ],
    requiredDocuments: [
      "DAAD application form",
      "Detailed CV (Europass format)",
      "Motivation letter (max 2 pages)",
      "Two letters of recommendation",
      "Proof of work experience",
      "University degree and transcripts",
      "Language certificates",
    ],
    applicationProcess: [
      "Choose an EPOS-listed Master's program",
      "Apply directly to the university with DAAD scholarship request",
      "Submit all documents before program-specific deadline",
      "Selection by university and DAAD committee",
      "Receive scholarship confirmation and visa support",
    ],
    officialLink: "https://www.daad.de/epos",
  },
  {
    slug: "kaad-scholarship-2026",
    title: "KAAD Scholarship for Developing Countries 2026",
    provider: "Catholic Academic Exchange Service (KAAD)",
    degreeLevel: "Masters & PhD",
    funding: "Fully Funded",
    deadline: "30 June 2026",
    location: "German Universities",
    shortDescription:
      "KAAD scholarships for postgraduate studies and doctoral research in Germany for students from Africa, Asia, the Middle East and Latin America.",
    about:
      "The Catholic Academic Exchange Service (KAAD) offers scholarships to graduates from developing countries who wish to pursue a Master's or Doctoral program in Germany. KAAD focuses on academic excellence and social engagement.",
    hostCountry: "Germany",
    studyIn: "All public German universities",
    category: "Masters / PhD",
    eligibleCountries: "Africa, Asia, Middle East, Latin America",
    benefits: [
      "Full monthly stipend",
      "Travel costs to and from Germany",
      "Health insurance coverage",
      "German language course (up to 6 months) before studies",
      "Tuition fees and study materials",
      "Spiritual and pastoral accompaniment",
    ],
    eligibility: [
      "Citizen of a developing country in Africa, Asia, Middle East or Latin America",
      "Catholic Christian or member of another Christian denomination",
      "University degree with above-average grades",
      "Recommendation from a KAAD partner committee in your country",
      "Willingness to return to home country after studies",
    ],
    requiredDocuments: [
      "Application form (KAAD)",
      "Curriculum vitae",
      "Letter of motivation",
      "Two letters of recommendation (academic & church)",
      "Acceptance letter from German university (or proof of application)",
      "Language certificate (German B1 or English)",
    ],
    applicationProcess: [
      "Contact the KAAD partner committee in your country",
      "Receive a recommendation from the partner committee",
      "Submit full application via the partner committee to KAAD Bonn",
      "Selection interview in your home country",
      "Receive scholarship offer and prepare for departure",
    ],
    officialLink: "https://kaad.de/en",
  },
  {
    slug: "friedrich-ebert-stiftung-2026",
    title: "Friedrich Ebert Stiftung Scholarship 2026",
    provider: "Friedrich Ebert Foundation",
    degreeLevel: "Masters & PhD",
    funding: "Fully Funded",
    deadline: "Rolling Admissions",
    location: "Germany",
    shortDescription:
      "Politically and socially engaged international students can apply for FES scholarships at any recognized German university.",
    about:
      "The Friedrich Ebert Stiftung (FES) supports academically gifted and socially committed international students who wish to study at universities in Germany. Scholars become part of an active alumni network committed to democracy and social justice.",
    hostCountry: "Germany",
    studyIn: "All recognized German universities",
    category: "Masters / PhD",
    eligibleCountries: "Worldwide (including Kenya)",
    benefits: [
      "Monthly stipend of up to €934",
      "Health insurance and additional allowances",
      "Family and child allowances if applicable",
      "Tuition fees covered",
      "Access to FES seminars, workshops and networking events",
    ],
    eligibility: [
      "Strong academic record",
      "Demonstrated social and political engagement",
      "Commitment to values of social democracy",
      "Admission to a German university",
      "German language proficiency (B2 minimum)",
    ],
    requiredDocuments: [
      "FES application form",
      "Detailed CV with focus on social engagement",
      "Motivation letter",
      "Two academic and one personal reference",
      "Transcripts and degree certificates",
      "Proof of German proficiency",
    ],
    applicationProcess: [
      "Receive admission to a German university",
      "Complete the online application on FES website",
      "Submit all required documents",
      "Attend selection interview if shortlisted",
      "Receive funding decision",
    ],
    officialLink: "https://www.fes.de/studienfoerderung",
  },
  {
    slug: "erasmus-mundus-germany-2026",
    title: "Erasmus Mundus Joint Master's Scholarship 2026",
    provider: "European Commission",
    degreeLevel: "Masters",
    funding: "Fully Funded",
    deadline: "Varies by program (Jan–Feb 2026)",
    location: "Germany + EU partner universities",
    shortDescription:
      "Study in Germany and other European countries through prestigious Erasmus Mundus Joint Master Degrees.",
    about:
      "Erasmus Mundus Joint Master Degrees (EMJMDs) are prestigious international study programs delivered by consortia of European universities, with German universities participating in many of them. Scholars study in at least two countries.",
    hostCountry: "Germany & EU",
    studyIn: "Multiple universities across Europe",
    category: "Masters",
    eligibleCountries: "All countries worldwide",
    benefits: [
      "Full tuition fees waived",
      "Monthly living allowance of €1,400",
      "Travel and installation allowance",
      "Comprehensive insurance coverage",
      "Mobility across multiple European countries",
    ],
    eligibility: [
      "Bachelor's degree in a relevant field",
      "English proficiency (IELTS 6.5+ or equivalent)",
      "Strong academic background",
      "Open to applicants worldwide",
    ],
    requiredDocuments: [
      "Online application form",
      "CV (Europass)",
      "Motivation letter",
      "Two recommendation letters",
      "Bachelor's degree and transcripts",
      "Proof of English proficiency",
      "Copy of passport",
    ],
    applicationProcess: [
      "Browse the Erasmus Mundus catalogue and choose a program",
      "Apply directly to the consortium coordinator",
      "Submit all required documents before deadline",
      "Selection by the consortium",
      "Receive scholarship offer and visa documentation",
    ],
    officialLink: "https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en",
  },
  {
    slug: "heinrich-boll-2026",
    title: "Heinrich Böll Foundation Scholarship 2026",
    provider: "Heinrich Böll Foundation",
    degreeLevel: "Bachelors, Masters & PhD",
    funding: "Fully Funded",
    deadline: "1 March & 1 September 2026",
    location: "Germany",
    shortDescription:
      "Funding for international students with strong academic records and active engagement in politics, society or the environment.",
    about:
      "The Heinrich Böll Foundation, affiliated with the German Green Party, supports around 1,500 students and doctoral candidates each year in Germany, including international scholars committed to ecology, democracy and human rights.",
    hostCountry: "Germany",
    studyIn: "State-recognized German universities",
    category: "Bachelors / Masters / PhD",
    eligibleCountries: "Worldwide (including Kenya)",
    benefits: [
      "Monthly stipend up to €934 (Master's) and €1,350 (PhD)",
      "Tuition fees and study materials",
      "Health insurance",
      "Family and child allowances",
      "Access to seminars, training and the foundation's international network",
    ],
    eligibility: [
      "Strong academic performance",
      "Engagement in social, political or ecological issues",
      "Admitted to a German university",
      "German language proficiency (B2 minimum)",
      "Identification with values of the Green movement",
    ],
    requiredDocuments: [
      "Online application form",
      "CV with focus on engagement",
      "Motivation letter",
      "Academic and personal references",
      "Transcripts and degree certificates",
      "Language certificates",
      "Proof of admission to German university",
    ],
    applicationProcess: [
      "Receive admission from a German university",
      "Apply online via Heinrich Böll Foundation portal",
      "Upload all required documents",
      "Attend selection interview if shortlisted",
      "Receive funding decision",
    ],
    officialLink: "https://www.boell.de/en/scholarships",
  },
];

export function getScholarship(slug: string) {
  return scholarships.find((s) => s.slug === slug);
}
