import { WHATSAPP_GROUP_URL } from "@/lib/constants";

export function whatsappUrlWithMessage(message: string): string {
  const encoded = encodeURIComponent(message);
  if (WHATSAPP_GROUP_URL.includes("?")) {
    return `${WHATSAPP_GROUP_URL}&text=${encoded}`;
  }
  return `${WHATSAPP_GROUP_URL}?text=${encoded}`;
}

export function eligibilityWhatsAppMessage(score: number, status: string): string {
  return `Hi German Nursing Pathway — I completed the eligibility check (${score}%, ${status}). I'd like guidance on next steps.`;
}

export function registerWhatsAppMessage(fullName: string): string {
  return `Hi, I just registered as ${fullName} on German Nursing Pathway. Looking forward to connecting!`;
}

export function scholarshipWhatsAppMessage(title: string, slug: string): string {
  return `Hi — I'm interested in the scholarship "${title}" (${slug}) on German Nursing Pathway.`;
}
