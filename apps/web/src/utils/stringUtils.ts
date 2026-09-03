export function getInitials(name: string | null | undefined, fallback = "U"): string {
  const normalizedName = String(name || "").trim();

  if (!normalizedName) {
    return fallback;
  }

  const parts = normalizedName.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
