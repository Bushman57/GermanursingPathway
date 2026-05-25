// Dummy auth for Phase 2 portal preview. NOT secure — replace with real auth later.
const KEY = "gnp_dummy_session";

export type DummySession = {
  email: string;
  fullName: string;
  loggedInAt: number;
};

export function getSession(): DummySession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DummySession) : null;
  } catch {
    return null;
  }
}

export function signIn(email: string, fullName?: string): DummySession {
  const session: DummySession = {
    email: email.trim().toLowerCase(),
    fullName: fullName?.trim() || email.split("@")[0],
    loggedInAt: Date.now(),
  };
  window.localStorage.setItem(KEY, JSON.stringify(session));
  return session;
}

export function signOut() {
  window.localStorage.removeItem(KEY);
}
