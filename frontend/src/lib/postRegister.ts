const KEY = "gnp_post_register";

export type PostRegisterContext = {
  email: string;
  full_name: string;
  registeredAt: string;
};

export function savePostRegisterContext(data: { email: string; full_name: string }) {
  const ctx: PostRegisterContext = {
    email: data.email.trim().toLowerCase(),
    full_name: data.full_name.trim(),
    registeredAt: new Date().toISOString(),
  };
  sessionStorage.setItem(KEY, JSON.stringify(ctx));
  return ctx;
}

export function loadPostRegisterContext(): PostRegisterContext | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PostRegisterContext) : null;
  } catch {
    return null;
  }
}

export function clearPostRegisterContext() {
  sessionStorage.removeItem(KEY);
}

export function isPostRegisterFlow(searchFrom?: string): boolean {
  return searchFrom === "register" || loadPostRegisterContext() !== null;
}
