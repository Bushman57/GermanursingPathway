/** German display fields keyed by scholarship slug */
export type ScholarshipDeFields = {
  titleDe?: string;
  shortDescriptionDe?: string;
  aboutDe?: string;
  providerDe?: string;
  degreeLevelDe?: string;
  fundingDe?: string;
  locationDe?: string;
  categoryDe?: string;
  deadlineDe?: string;
  benefitsDe?: string[];
  eligibilityDe?: string[];
  requiredDocumentsDe?: string[];
  applicationProcessDe?: string[];
};

export const scholarshipDeBySlug: Record<string, ScholarshipDeFields> = {
  "berlin-nursing-scholarship-2026": {
    titleDe: "Berlin Pflegestipendium 2026",
    providerDe: "Berlin Nursing Institute",
    degreeLevelDe: "Pflegestipendium",
    fundingDe: "Voll finanziert",
    deadlineDe: "30. September 2026",
    locationDe: "Berlin, Deutschland",
    shortDescriptionDe:
      "Agentur-verifiziertes Stipendium für kenianische Diplom- und BSc-Pflegekräfte — Studiengebühren, Zuschuss und Klinikplatzierung in Berlin.",
    aboutDe:
      "Dieser verifizierte Pfad begleitet qualifizierte kenianische Pflegekräfte durch Sprachvorbereitung, Anerkennungsberatung und strukturierte Platzierung bei Partnerkrankenhäusern in Berlin. Plätze sind begrenzt und werden nach Deutschkenntnissen und Berufserfahrung vergeben.",
    categoryDe: "Pflege / Gesundheitswesen",
    benefitsDe: [
      "Studiengebührenübernahme über Partnerschule",
      "Monatlicher Lebensunterhaltszuschuss während der Ausbildung",
      "Beratung zur Krankenversicherung",
      "Koordination der Klinikplatzierung",
      "Visum-Unterstützungspaket",
    ],
    eligibilityDe: [
      "Kenianische Staatsbürgerschaft",
      "Diplom oder BSc Pflege (oder gleichwertig)",
      "Mindestens A2 Deutsch (B1 bevorzugt)",
      "Gültiger Reisepass",
      "Bereitschaft zum Umzug nach Deutschland",
    ],
    requiredDocumentsDe: [
      "Pflegediplom/-abschluss und Zeugnisse",
      "Lebenslauf im deutschen Format",
      "Deutschzertifikat",
      "Reisepasskopie",
      "Motivationsschreiben",
    ],
    applicationProcessDe: [
      "Interesse über German Nursing Pathway registrieren",
      "Eignungsprüfung abschließen",
      "Unterlagen zur Verifizierung einreichen",
      "Schulinterview (Deutsch/Englisch)",
      "Zusage erhalten und Visumprozess starten",
    ],
  },
  "nrw-ausbildung-nursing-2026": {
    titleDe: "NRW Pflege-Ausbildung 2026",
    providerDe: "NRW Health Academy",
    degreeLevelDe: "Ausbildung",
    fundingDe: "Vergütete Ausbildung",
    deadlineDe: "15. August 2026",
    locationDe: "Nordrhein-Westfalen, Deutschland",
    shortDescriptionDe:
      "Vergütete pflegerische Berufsausbildung (Ausbildung) mit Arbeitgeberförderung — verdienen Sie während der Ausbildung in NRW.",
    aboutDe:
      "Ein verifizierter Ausbildungsweg für kenianische Gesundheitsfachkräfte mit 2–3 Jahren bezahlter Lehre. Inklusive Arbeitgebervermittlung, Sprachpfad und strukturierter Integrationsbegleitung durch NRW-Partner.",
    categoryDe: "Ausbildung / Beruflich",
    benefitsDe: [
      "Vergütete Ausbildung (ca. 850–1.200 €/Monat)",
      "Arbeitgeberfinanzierter Visumsweg",
      "Sprachkursvermittlung",
      "Beratung zu Wohnung und Relocation",
    ],
    eligibilityDe: [
      "Kenianische Staatsbürgerschaft, 18–35 Jahre",
      "CNA, Diplom oder Abschluss im Gesundheitsbereich",
      "Mindestens A1 Deutsch (A2 bis Einstieg)",
      "Anerkannte Schulabschlussqualifikation",
    ],
    requiredDocumentsDe: [
      "Bildungsnachweise",
      "Lebenslauf und Motivationsschreiben",
      "Sprachzertifikat (falls vorhanden)",
      "Reisepass",
    ],
    applicationProcessDe: [
      "Bei German Nursing Pathway registrieren",
      "Profil- und Dokumentenprüfung",
      "Arbeitgeber-/Schulmatching",
      "Vertrag und Visumvorbereitung",
      "Ankunft und Integrationsbegleitung",
    ],
  },
  "munich-clinical-nursing-pathway-2027": {
    titleDe: "München Klinischer Pflegepfad 2027",
    providerDe: "Munich Care College",
    degreeLevelDe: "Pflegeplatzierung",
    fundingDe: "Teilstipendium",
    deadlineDe: "1. Dezember 2026",
    locationDe: "München, Deutschland",
    shortDescriptionDe:
      "Klinischer Platzierungspfad mit Teilstipendium für erfahrene kenianische Pflegekräfte in bayerischen Krankenhäusern.",
    aboutDe:
      "Für Pflegekräfte mit mindestens 2 Jahren Berufserfahrung und direktem Klinikziel in München. Inklusive Anpassungsprogramm, B1+ Deutsch und Krankenhausvermittlung.",
    categoryDe: "Pflege / Gesundheitswesen",
    benefitsDe: [
      "Teilstipendium für Studiengebühren",
      "Unterstützung bei Krankenhausplatzierung",
      "Zugang zum Anpassungsprogramm",
      "Orientierung vor Abreise",
    ],
    eligibilityDe: [
      "Mindestens 2 Jahre klinische Pflegeerfahrung",
      "B1 Deutsch oder Verpflichtung bis B1 vor Einstieg",
      "Diplom oder Abschluss Pflege",
      "Einwandfreier beruflicher Nachweis",
    ],
    requiredDocumentsDe: [
      "Berufliche Referenzen",
      "Pflegenachweise",
      "Sprachzertifikat",
      "Lebenslauf und Motivationsschreiben",
    ],
    applicationProcessDe: [
      "Interesse-Formular einreichen",
      "Verifizierung der Berufserfahrung",
      "Sprachbewertung",
      "Matching-Interview mit Krankenhaus",
      "Zusage und Visumunterstützung",
    ],
  },
  "german-bundestag-ips-africa-2027": {
    titleDe: "Deutscher Bundestag IPS Afrika-Stipendium 2027",
    providerDe: "Deutscher Bundestag",
    degreeLevelDe: "Praktikumsprogramm",
    fundingDe: "Voll finanziert",
    deadlineDe: "7. Mai 2026",
    locationDe: "Berlin, Deutschland",
    shortDescriptionDe:
      "Fünfmonatiges voll finanziertes Praktikum im Deutschen Bundestag in Berlin für afrikanische Absolventen mit Interesse an Politik und Parlamentsarbeit.",
    aboutDe:
      "Der Deutsche Bundestag bietet in Kooperation mit Humboldt-Universität, Freie Universität und TU Berlin das Internationale Parlaments-Stipendium (IPS) für Afrika. Das Programm ermöglicht jungen, politisch interessierten Hochschulabsolventen Einblicke in das deutsche Parlamentssystem durch Mitarbeit bei einem Bundestagsabgeordneten über fünf Monate.",
    categoryDe: "Praktikum / Fellowship",
    benefitsDe: [
      "Monatliches Stipendium von 500 €",
      "Kostenlose Unterkunft in Berlin",
      "Kranken-, Unfall- und Haftpflichtversicherung",
      "Reisekosten nach Deutschland und zurück",
      "Visumgebühr übernommen",
      "5-monatige Mitarbeit bei einem MdB",
      "Akademisches Begleitprogramm an drei Berliner Universitäten",
    ],
    eligibilityDe: [
      "Staatsbürgerschaft eines berechtigten afrikanischen Landes (inkl. Kenia)",
      "Hochschulabschluss zu Programmbeginn",
      "Sehr gute Deutschkenntnisse (mindestens B2)",
      "Grundkenntnisse deutscher Geschichte und des politischen Systems",
      "Unter 30 Jahre zu Programmbeginn",
      "Starkes politisches Interesse und Engagement",
    ],
    requiredDocumentsDe: [
      "Ausgefülltes Bewerbungsformular",
      "Lebenslauf",
      "Zwei Empfehlungsschreiben",
      "Beglaubigte Abschluss- und Notenkopien",
      "Nachweis Deutschkenntnisse (B2 oder höher)",
      "Motivationsschreiben",
      "Reisepasskopie",
    ],
    applicationProcessDe: [
      "Offizielle IPS-Seite der deutschen Botschaft / des Bundestags besuchen",
      "Offizielles Bewerbungsformular herunterladen und ausfüllen",
      "Alle Unterlagen auf Deutsch vorbereiten",
      "Vollständige Bewerbung an die deutsche Botschaft senden",
      "Vorstellungsgespräch für Shortlist",
      "Ausgewählte Teilnehmer reisen nach Berlin (Mär–Jul)",
    ],
  },
  "daad-epos-masters-2026": {
    titleDe: "DAAD EPOS Master-Stipendium 2026/2027",
    providerDe: "DAAD",
    degreeLevelDe: "Master",
    fundingDe: "Voll finanziert",
    deadlineDe: "31. Oktober 2026",
    locationDe: "Verschiedene deutsche Universitäten",
    shortDescriptionDe:
      "DAAD entwicklungsbezogene Postgraduiertenkurse (EPOS) für Fachkräfte aus Entwicklungsländern.",
    aboutDe:
      "Das DAAD-EPOS-Programm bietet voll finanzierte Master-Stipendien für qualifizierte Fachkräfte aus Entwicklungsländern in entwicklungsrelevanten Fächern an deutschen Spitzenuniversitäten.",
    categoryDe: "Master / Promotion",
    benefitsDe: [
      "Monatliches Stipendium von 934 €",
      "Reisekostenpauschale",
      "Kranken-, Unfall- und Haftpflichtversicherung",
      "Studiengebühren übernommen",
      "Studien- und Forschungszuschuss",
      "Miet- und Familienzuschuss (falls zutreffend)",
    ],
    eligibilityDe: [
      "Bachelorabschluss (4 Jahre) in relevantem Fach",
      "Mindestens 2 Jahre Berufserfahrung",
      "Staatsbürgerschaft eines Entwicklungslandes",
      "Abschluss nicht älter als 6 Jahre",
      "Sprachkenntnisse: Englisch (IELTS/TOEFL) oder Deutsch",
    ],
    requiredDocumentsDe: [
      "DAAD-Bewerbungsformular",
      "Detaillierter Lebenslauf (Europass)",
      "Motivationsschreiben (max. 2 Seiten)",
      "Zwei Empfehlungsschreiben",
      "Nachweis Berufserfahrung",
      "Hochschulabschluss und Zeugnisse",
      "Sprachzertifikate",
    ],
    applicationProcessDe: [
      "EPOS-gelistetes Master-Programm wählen",
      "Direkt bei der Universität mit DAAD-Stipendienantrag bewerben",
      "Alle Unterlagen vor programmspezifischer Frist einreichen",
      "Auswahl durch Universität und DAAD-Gremium",
      "Stipendienzusage und Visumunterstützung",
    ],
  },
  "kaad-scholarship-2026": {
    titleDe: "KAAD-Stipendium für Entwicklungsländer 2026",
    providerDe: "Katholischer Akademischer Ausländerdienst (KAAD)",
    degreeLevelDe: "Master & Promotion",
    fundingDe: "Voll finanziert",
    deadlineDe: "30. Juni 2026",
    locationDe: "Deutsche Universitäten",
    shortDescriptionDe:
      "KAAD-Stipendien für Postgraduiertenstudium und Promotion in Deutschland für Studierende aus Afrika, Asien, Nahost und Lateinamerika.",
    aboutDe:
      "Der KAAD fördert Absolventen aus Entwicklungsländern für Master- oder Doktoratsprogramme in Deutschland mit Fokus auf akademische Exzellenz und gesellschaftliches Engagement.",
    categoryDe: "Master / Promotion",
    benefitsDe: [
      "Vollständiges monatliches Stipendium",
      "Reisekosten nach Deutschland und zurück",
      "Krankenversicherung",
      "Deutschkurs (bis 6 Monate) vor dem Studium",
      "Studiengebühren und Materialien",
      "Spirituelle und pastorale Begleitung",
    ],
    eligibilityDe: [
      "Staatsbürgerschaft eines Entwicklungslandes in Afrika, Asien, Nahost oder Lateinamerika",
      "Katholisch oder andere christliche Konfession",
      "Hochschulabschluss mit überdurchschnittlichen Noten",
      "Empfehlung eines KAAD-Partnergremiums im Heimatland",
      "Rückkehrbereitschaft nach dem Studium",
    ],
    requiredDocumentsDe: [
      "KAAD-Bewerbungsformular",
      "Lebenslauf",
      "Motivationsschreiben",
      "Zwei Empfehlungen (akademisch & kirchlich)",
      "Zulassung deutscher Universität (oder Bewerbungsnachweis)",
      "Sprachzertifikat (Deutsch B1 oder Englisch)",
    ],
    applicationProcessDe: [
      "KAAD-Partnergremium im Heimatland kontaktieren",
      "Empfehlung vom Partnergremium erhalten",
      "Vollständige Bewerbung über Partnergremium an KAAD Bonn",
      "Auswahlgespräch im Heimatland",
      "Stipendienangebot und Abreisevorbereitung",
    ],
  },
  "friedrich-ebert-stiftung-2026": {
    titleDe: "Friedrich-Ebert-Stiftung Stipendium 2026",
    providerDe: "Friedrich-Ebert-Stiftung",
    degreeLevelDe: "Master & Promotion",
    fundingDe: "Voll finanziert",
    deadlineDe: "Laufende Bewerbung",
    locationDe: "Deutschland",
    shortDescriptionDe:
      "Politisch und gesellschaftlich engagierte internationale Studierende können FES-Stipendien an anerkannten deutschen Universitäten beantragen.",
    aboutDe:
      "Die Friedrich-Ebert-Stiftung fördert begabte und sozial engagierte internationale Studierende in Deutschland. Stipendiaten werden Teil eines aktiven Alumni-Netzwerks für Demokratie und soziale Gerechtigkeit.",
    categoryDe: "Master / Promotion",
    benefitsDe: [
      "Monatliches Stipendium bis 934 €",
      "Krankenversicherung und Zusatzleistungen",
      "Familien- und Kinderzuschüsse falls zutreffend",
      "Studiengebühren übernommen",
      "FES-Seminare, Workshops und Networking",
    ],
    eligibilityDe: [
      "Starke akademische Leistung",
      "Nachgewiesenes soziales und politisches Engagement",
      "Verpflichtung zu Werten der Sozialdemokratie",
      "Zulassung an einer deutschen Universität",
      "Deutschkenntnisse (mindestens B2)",
    ],
    requiredDocumentsDe: [
      "FES-Bewerbungsformular",
      "Detaillierter Lebenslauf mit Engagement",
      "Motivationsschreiben",
      "Zwei akademische und eine persönliche Referenz",
      "Zeugnisse und Abschlussnachweise",
      "Nachweis Deutschkenntnisse",
    ],
    applicationProcessDe: [
      "Zulassung an deutscher Universität erhalten",
      "Online-Bewerbung auf der FES-Website",
      "Alle Unterlagen einreichen",
      "Auswahlgespräch bei Shortlist",
      "Förderentscheidung erhalten",
    ],
  },
  "erasmus-mundus-germany-2026": {
    titleDe: "Erasmus Mundus Joint Master Stipendium 2026",
    providerDe: "Europäische Kommission",
    degreeLevelDe: "Master",
    fundingDe: "Voll finanziert",
    deadlineDe: "Je nach Programm (Jan.–Feb. 2026)",
    locationDe: "Deutschland + EU-Partneruniversitäten",
    shortDescriptionDe:
      "Studium in Deutschland und anderen EU-Ländern durch prestigeträchtige Erasmus-Mundus-Joint-Master-Programme.",
    aboutDe:
      "Erasmus-Mundus-Joint-Master-Grade (EMJMD) sind internationale Studienprogramme von EU-Universitätskonsortien, oft mit deutscher Beteiligung. Stipendiaten studieren in mindestens zwei Ländern.",
    categoryDe: "Master",
    benefitsDe: [
      "Vollständige Studiengebührenerlass",
      "Monatlicher Lebensunterhalt 1.400 €",
      "Reise- und Installationszuschuss",
      "Umfassende Versicherung",
      "Mobilität in mehreren europäischen Ländern",
    ],
    eligibilityDe: [
      "Bachelorabschluss in relevantem Fach",
      "Englischkenntnisse (IELTS 6.5+ oder gleichwertig)",
      "Starke akademische Voraussetzungen",
      "Offen für Bewerber weltweit",
    ],
    requiredDocumentsDe: [
      "Online-Bewerbungsformular",
      "Lebenslauf (Europass)",
      "Motivationsschreiben",
      "Zwei Empfehlungsschreiben",
      "Bachelorabschluss und Zeugnisse",
      "Nachweis Englischkenntnisse",
      "Reisepasskopie",
    ],
    applicationProcessDe: [
      "Erasmus-Mundus-Katalog durchsuchen und Programm wählen",
      "Direkt beim Konsortienkoordinator bewerben",
      "Alle Unterlagen vor Frist einreichen",
      "Auswahl durch das Konsortium",
      "Stipendienangebot und Visumsunterlagen",
    ],
  },
  "heinrich-boll-2026": {
    titleDe: "Heinrich-Böll-Stiftung Stipendium 2026",
    providerDe: "Heinrich-Böll-Stiftung",
    degreeLevelDe: "Bachelor, Master & Promotion",
    fundingDe: "Voll finanziert",
    deadlineDe: "1. März & 1. September 2026",
    locationDe: "Deutschland",
    shortDescriptionDe:
      "Förderung für internationale Studierende mit starken akademischen Leistungen und Engagement in Politik, Gesellschaft oder Umwelt.",
    aboutDe:
      "Die Heinrich-Böll-Stiftung, verbunden mit Bündnis 90/Die Grünen, fördert jährlich rund 1.500 Studierende und Promovierende in Deutschland, inklusive internationaler Gefährten für Ökologie, Demokratie und Menschenrechte.",
    categoryDe: "Bachelor / Master / Promotion",
    benefitsDe: [
      "Monatliches Stipendium bis 934 € (Master) und 1.350 € (Promotion)",
      "Studiengebühren und Materialien",
      "Krankenversicherung",
      "Familien- und Kinderzuschüsse",
      "Seminare, Schulungen und internationales Netzwerk",
    ],
    eligibilityDe: [
      "Starke akademische Leistung",
      "Engagement in sozialen, politischen oder ökologischen Themen",
      "Zulassung an deutscher Universität",
      "Deutschkenntnisse (mindestens B2)",
      "Identifikation mit Werten der Grünen Bewegung",
    ],
    requiredDocumentsDe: [
      "Online-Bewerbungsformular",
      "Lebenslauf mit Engagement-Schwerpunkt",
      "Motivationsschreiben",
      "Akademische und persönliche Referenzen",
      "Zeugnisse und Abschlussnachweise",
      "Sprachzertifikate",
      "Nachweis Universitätszulassung",
    ],
    applicationProcessDe: [
      "Zulassung von deutscher Universität erhalten",
      "Online über Portal der Heinrich-Böll-Stiftung bewerben",
      "Alle Unterlagen hochladen",
      "Auswahlgespräch bei Shortlist",
      "Förderentscheidung erhalten",
    ],
  },
};
