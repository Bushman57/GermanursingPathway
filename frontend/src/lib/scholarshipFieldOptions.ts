export type FieldOption = { value: string; label: string };

export const PROGRAM_TYPE_OPTIONS: FieldOption[] = [
  { value: "ausbildung", label: "Ausbildung" },
  { value: "nursing_scholarship", label: "Nursing Scholarship" },
  { value: "caregiver_pathway", label: "Caregiver Pathway" },
  { value: "internship", label: "Internship" },
  { value: "vocational_training", label: "Vocational Training" },
  { value: "other", label: "Other" },
];

export const VERIFICATION_STATUS_OPTIONS: FieldOption[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "pending", label: "Pending Verification" },
];

export const DATA_VERIFICATION_STATUS_OPTIONS: FieldOption[] = [
  { value: "draft", label: "Draft" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "needs_update", label: "Needs Update" },
];

export const LANGUAGE_OF_INSTRUCTION_OPTIONS: FieldOption[] = [
  { value: "german", label: "German" },
  { value: "german_english", label: "German & English" },
  { value: "other", label: "Other" },
];

export const DEGREE_LEVEL_OPTIONS: FieldOption[] = [
  { value: "certificate", label: "Certificate" },
  { value: "vocational_training", label: "Vocational Training" },
  { value: "professional_training", label: "Professional Training" },
  { value: "not_specified", label: "Not Specified" },
];

export const FUNDING_TYPE_OPTIONS: FieldOption[] = [
  { value: "fully_funded", label: "Fully Funded" },
  { value: "partially_funded", label: "Partially Funded" },
  { value: "self_sponsored", label: "Self Sponsored" },
  { value: "paid_training", label: "Paid Training" },
  { value: "salary_based", label: "Salary Based" },
  { value: "scholarship_plus_salary", label: "Scholarship + Salary" },
];

export const VISA_SPONSORSHIP_OPTIONS: FieldOption[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not_specified", label: "Not Specified" },
];

export const ACCOMMODATION_SUPPORT_OPTIONS: FieldOption[] = [
  { value: "free_accommodation", label: "Free Accommodation" },
  { value: "subsidized_accommodation", label: "Subsidized Accommodation" },
  { value: "accommodation_assistance", label: "Accommodation Assistance" },
  { value: "no_accommodation", label: "No Accommodation" },
  { value: "not_specified", label: "Not Specified" },
];

export const GERMAN_LEVEL_OPTIONS: FieldOption[] = [
  { value: "none", label: "None" },
  { value: "a1", label: "A1" },
  { value: "a2", label: "A2" },
  { value: "b1", label: "B1" },
  { value: "b2", label: "B2" },
  { value: "c1", label: "C1" },
  { value: "flexible", label: "Flexible" },
  { value: "to_be_provided", label: "To Be Provided" },
];

export const APPLICATION_STATUS_OPTIONS: FieldOption[] = [
  { value: "open", label: "Open" },
  { value: "closing_soon", label: "Closing Soon" },
  { value: "closed", label: "Closed" },
  { value: "upcoming", label: "Upcoming" },
  { value: "suspended", label: "Suspended" },
];

export const INTAKE_MONTH_OPTIONS: FieldOption[] = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
].map((m) => ({ value: m, label: m.charAt(0).toUpperCase() + m.slice(1) }));

export const PROGRAM_DURATION_OPTIONS: FieldOption[] = [
  { value: "less_than_1_year", label: "Less than 1 Year" },
  { value: "1_year", label: "1 Year" },
  { value: "2_years", label: "2 Years" },
  { value: "3_years", label: "3 Years" },
  { value: "3_5_years", label: "3.5 Years" },
  { value: "4_years", label: "4 Years" },
  { value: "flexible", label: "Flexible" },
];

export const RECOGNITION_SUPPORT_OPTIONS: FieldOption[] = [
  { value: "full_recognition_support", label: "Full Recognition Support" },
  { value: "partial_recognition_support", label: "Partial Recognition Support" },
  { value: "no_recognition_support", label: "No Recognition Support" },
  { value: "not_applicable", label: "Not Applicable" },
];

export const INTERVIEW_REQUIRED_OPTIONS: FieldOption[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "maybe", label: "Maybe" },
];

export const APPLICATION_METHOD_OPTIONS: FieldOption[] = [
  { value: "online_portal", label: "Online Portal" },
  { value: "email_application", label: "Email Application" },
  { value: "agency_application", label: "Agency Application" },
  { value: "direct_institution", label: "Direct Institution Application" },
  { value: "physical_submission", label: "Physical Submission" },
  { value: "hybrid", label: "Hybrid" },
];

export const PROVIDER_TYPE_OPTIONS: FieldOption[] = [
  { value: "hospital", label: "Hospital" },
  { value: "university", label: "University" },
  { value: "nursing_school", label: "Nursing School" },
  { value: "government_institution", label: "Government Institution" },
  { value: "ngo", label: "NGO" },
  { value: "private_company", label: "Private Company" },
  { value: "recruitment_agency", label: "Recruitment Agency" },
  { value: "elderly_care_facility", label: "Elderly Care Facility" },
];

export const TARGET_APPLICANTS_OPTIONS: FieldOption[] = [
  { value: "high_school_graduates", label: "High School Graduates" },
  { value: "diploma_holders", label: "Diploma Holders" },
  { value: "degree_holders", label: "Degree Holders" },
  { value: "nurses", label: "Nurses" },
  { value: "caregivers", label: "Caregivers" },
  { value: "international_students", label: "International Students" },
  { value: "kenyan_applicants", label: "Kenyan Applicants" },
  { value: "african_applicants", label: "African Applicants" },
  { value: "fresh_graduates", label: "Fresh Graduates" },
];

export const SCHOLARSHIP_BENEFITS_OPTIONS: FieldOption[] = [
  { value: "monthly_stipend", label: "Monthly Stipend" },
  { value: "tuition_coverage", label: "Tuition Coverage" },
  { value: "visa_sponsorship", label: "Visa Sponsorship" },
  { value: "flight_ticket", label: "Flight Ticket" },
  { value: "free_accommodation", label: "Free Accommodation" },
  { value: "health_insurance", label: "Health Insurance" },
  { value: "german_classes", label: "German Classes" },
  { value: "relocation_support", label: "Relocation Support" },
  { value: "meal_allowance", label: "Meal Allowance" },
  { value: "paid_internship", label: "Paid Internship" },
  { value: "employment_guarantee", label: "Employment Guarantee" },
];

export const REQUIRED_DOCUMENTS_OPTIONS: FieldOption[] = [
  { value: "passport", label: "Passport" },
  { value: "cv_resume", label: "CV/Resume" },
  { value: "academic_certificates", label: "Academic Certificates" },
  { value: "transcripts", label: "Transcripts" },
  { value: "recommendation_letter", label: "Recommendation Letter" },
  { value: "motivation_letter", label: "Motivation Letter" },
  { value: "german_certificate", label: "German Certificate" },
  { value: "english_certificate", label: "English Certificate" },
  { value: "police_clearance", label: "Police Clearance" },
  { value: "medical_report", label: "Medical Report" },
  { value: "birth_certificate", label: "Birth Certificate" },
  { value: "passport_photo", label: "Passport Photo" },
];

export const SCHOLARSHIP_TAGS_OPTIONS: FieldOption[] = [
  { value: "nursing", label: "Nursing" },
  { value: "ausbildung", label: "Ausbildung" },
  { value: "fully_funded", label: "Fully Funded" },
  { value: "germany", label: "Germany" },
  { value: "caregiver", label: "Caregiver" },
  { value: "paid_training", label: "Paid Training" },
  { value: "english_friendly", label: "English Friendly" },
  { value: "visa_sponsored", label: "Visa Sponsored" },
  { value: "pr_pathway", label: "PR Pathway" },
  { value: "no_ielts", label: "No IELTS" },
  { value: "b1_required", label: "B1 Required" },
  { value: "healthcare", label: "Healthcare" },
  { value: "international_students", label: "International Students" },
  { value: "eu_opportunity", label: "EU Opportunity" },
  { value: "urgent_intake", label: "Urgent Intake" },
];

const ALL_OPTIONS: FieldOption[] = [
  ...PROGRAM_TYPE_OPTIONS,
  ...VERIFICATION_STATUS_OPTIONS,
  ...DATA_VERIFICATION_STATUS_OPTIONS,
  ...LANGUAGE_OF_INSTRUCTION_OPTIONS,
  ...DEGREE_LEVEL_OPTIONS,
  ...FUNDING_TYPE_OPTIONS,
  ...VISA_SPONSORSHIP_OPTIONS,
  ...ACCOMMODATION_SUPPORT_OPTIONS,
  ...GERMAN_LEVEL_OPTIONS,
  ...APPLICATION_STATUS_OPTIONS,
  ...INTAKE_MONTH_OPTIONS,
  ...PROGRAM_DURATION_OPTIONS,
  ...RECOGNITION_SUPPORT_OPTIONS,
  ...INTERVIEW_REQUIRED_OPTIONS,
  ...APPLICATION_METHOD_OPTIONS,
  ...PROVIDER_TYPE_OPTIONS,
  ...TARGET_APPLICANTS_OPTIONS,
  ...SCHOLARSHIP_BENEFITS_OPTIONS,
  ...REQUIRED_DOCUMENTS_OPTIONS,
  ...SCHOLARSHIP_TAGS_OPTIONS,
];

const labelByValue = new Map(ALL_OPTIONS.map((o) => [o.value, o.label]));

/** Display label for a stored value; falls back to humanized raw value. */
export function optionLabel(value: string | undefined | null): string {
  if (!value) return "—";
  return labelByValue.get(value) ?? value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function fundingDisplayLabel(funding: string | undefined | null): string {
  if (!funding) return "";
  if (labelByValue.has(funding)) return optionLabel(funding);
  return funding;
}
