const prefix = "gnp_portal_prefs:";

export type NotifyPrefs = {
  notifyDeadlines: boolean;
  notifyDocuments: boolean;
};

export function getNotifyPrefs(email: string): NotifyPrefs {
  try {
    const raw = localStorage.getItem(`${prefix}${email}`);
    if (raw) return JSON.parse(raw) as NotifyPrefs;
  } catch {
    /* ignore */
  }
  return { notifyDeadlines: true, notifyDocuments: true };
}

export function setNotifyPrefs(email: string, prefs: NotifyPrefs) {
  localStorage.setItem(`${prefix}${email}`, JSON.stringify(prefs));
}
