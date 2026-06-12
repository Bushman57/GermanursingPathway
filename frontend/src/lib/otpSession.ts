const KEY = "gnp_otp_pending";

export type OtpPendingState = {
  email: string;
  step: "code";
  sentAt: string;
};

export function saveOtpPendingState(email: string) {
  const state: OtpPendingState = {
    email: email.trim().toLowerCase(),
    step: "code",
    sentAt: new Date().toISOString(),
  };
  sessionStorage.setItem(KEY, JSON.stringify(state));
}

export function loadOtpPendingState(): OtpPendingState | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OtpPendingState;
    if (parsed.step !== "code" || !parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearOtpPendingState() {
  sessionStorage.removeItem(KEY);
}
