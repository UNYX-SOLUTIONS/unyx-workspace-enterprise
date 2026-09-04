export function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

export function resolveDate(value: unknown): Date | null {
  if (!value) return null;

  if (typeof value === "object" && value !== null && "toDate" in value) {
    const toDate = (value as { toDate: () => Date }).toDate;
    if (typeof toDate === "function") return toDate();
  }

  if (typeof value === "object" && value !== null && "seconds" in value) {
    const seconds = (value as { seconds?: unknown }).seconds;
    if (typeof seconds === "number") return new Date(seconds * 1000);
  }

  const raw = String(value);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T12:00:00`)
    : new Date(raw);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: unknown, fallback = ""): string {
  const date = resolveDate(value);
  if (!date) return fallback;
  return date.toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function normalizeDate(value: unknown): string {
  const date = resolveDate(value);
  if (!date) return todayIso();
  return date.toISOString().split("T")[0];
}

export function getDateTimestamp(value: unknown): number {
  const date = resolveDate(value);
  return date ? date.getTime() : 0;
}
