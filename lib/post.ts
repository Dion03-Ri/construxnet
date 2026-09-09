/**
 * Gemeinsames zum Beitrag.
 *
 * Diese drei Dinge standen in `NetworkFeed.tsx`. Seit es die Beitrags-
 * seite und die ausgelagerten Handlungen gibt, brauchen sie drei Stellen —
 * also einmal hier.
 */
export const POST_TYPES: Record<string, { label: string }> = {
  UPDATE: { label: "Update" },
  JOB: { label: "Stellen" },
  MATERIAL_OFFER: { label: "Material-Angebot" },
  PROJECT: { label: "Projekt" },
  ANNOUNCEMENT: { label: "Ankündigung" },
  QUESTION: { label: "Frage" },
};

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} Min.`;
  const h = Math.floor(min / 60);
  if (h < 24) return `vor ${h} Std.`;
  const d = Math.floor(h / 24);
  if (d < 7) return `vor ${d} T.`;
  return new Date(iso).toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

/** Adresse eines Beitrags — die Stelle, auf die „Teilen" zeigt. */
export function postUrl(id: string) {
  const grund = typeof window === "undefined" ? "https://www.obtanet.com" : window.location.origin;
  return `${grund}/beitrag/${id}`;
}
