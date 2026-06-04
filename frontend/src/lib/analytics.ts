type AnalyticsEvent =
  | "eligibility_complete"
  | "register_submit"
  | "otp_verify"
  | "scholarship_save"
  | "external_apply_click"
  | "whatsapp_context_click";

export function trackEvent(name: AnalyticsEvent, params?: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  const w = window as Window & { gtag?: (...args: unknown[]) => void };
  w.gtag?.("event", name, params);
}
