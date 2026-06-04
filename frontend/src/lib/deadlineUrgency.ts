export type DeadlineUrgency = "rolling" | "soon" | "normal" | "unknown";

const MONTHS: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

export function parseDeadlineDate(text: string): Date | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  if (
    lower.includes("rolling") ||
    lower.includes("ongoing") ||
    lower.includes("open") ||
    lower.includes("varies")
  ) {
    return null;
  }
  const direct = Date.parse(trimmed);
  if (!Number.isNaN(direct)) return new Date(direct);
  const match = trimmed.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (match) {
    const month = MONTHS[match[2].toLowerCase()];
    if (month !== undefined) {
      return new Date(Number(match[3]), month, Number(match[1]));
    }
  }
  return null;
}

export function deadlineUrgency(deadlineText: string): DeadlineUrgency {
  const lower = deadlineText.toLowerCase();
  if (
    lower.includes("rolling") ||
    lower.includes("ongoing") ||
    lower.includes("open") ||
    lower.includes("varies")
  ) {
    return "rolling";
  }
  const date = parseDeadlineDate(deadlineText);
  if (!date) return "unknown";
  const days = (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (days < 0) return "unknown";
  if (days <= 45) return "soon";
  return "normal";
}
