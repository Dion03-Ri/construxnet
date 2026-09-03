/**
 * Medien, die nicht im Projekt liegen, sondern extern gehostet sind.
 *
 * Videos gehören nicht ins Git-Repository: sie sind gross, ändern sich selten
 * und blähen jeden Klon auf. Sie liegen darum im Vercel Blob Store, und hier
 * steht nur die Adresse.
 *
 * Solange die Adresse leer ist, zeigt die Startseite den Abschnitt ohne Video —
 * es bricht nichts und es steht kein toter Rahmen herum.
 *
 * Hochladen (einmalig, im Projektordner):
 *   npx vercel login
 *   npx vercel link
 *   npx vercel blob create-store obtanet-media --access public
 *   npx vercel blob put ./ablauf.mp4 --pathname video/ablauf.mp4 --access public
 *
 * Der Befehl gibt eine Adresse der Form
 *   https://<id>.public.blob.vercel-storage.com/video/ablauf.mp4
 * zurück. Diese hier eintragen.
 */
export const PROCESS_VIDEO_URL = "";

/** Standbild, das vor dem Abspielen steht. Optional, gleiche Ablage. */
export const PROCESS_VIDEO_POSTER = "";

/** Kurze Beschreibung für Menschen, die den Ton nicht hören können. */
export const PROCESS_VIDEO_LABEL =
  "Ablauf auf Obtanet: Bedarf melden, bündeln, verdeckte Angebote, Zuschlag.";

/* ==================================================================
   BILDPLÄTZE AUF DER STARTSEITE
   ------------------------------------------------------------------
   Die Hauptmomente der Seite brauchen kein Foto — die Bewehrungsstäbe
   und die Bündelungs-Grafik sind selbst gebaut. Fotos helfen nur an
   zwei Stellen, und dort ist es Material, nie Mensch.

   Solange `src` leer ist, zeigt die Seite einen beschrifteten Platz
   mit genau dieser Suchbeschreibung — so ist beim Ansehen klar, was
   dorthin gehört und in welchem Seitenverhältnis.

   Regeln fürs Aussuchen:
   · Material, kein Mensch. Keine Helme, keine Tablets, kein Handschlag.
   · Ruhiges, seitliches Licht. Keine bunten Sonnenuntergänge.
   · Ausschnitt nah genug, dass die Struktur trägt.
   · Vor dem Ablegen auf 1800 px verkleinern (mozjpeg, ~200 KB).
   ================================================================== */
export type PhotoSlot = {
  /** Pfad unter /public, sobald ein Bild vorliegt. Leer = Platzhalter. */
  src: string;
  /** Was auf dem Bild zu sehen sein soll — auch der Alt-Text. */
  alt: string;
  /** Suchbegriffe für Unsplash, Pexels oder Adobe Stock. */
  search: string;
};

export const PHOTO_POOLS: PhotoSlot = {
  src: "",
  alt: "Frisch geschalteter Beton, Oberfläche mit sichtbarer Schalungsstruktur",
  search: "concrete formwork texture · Betonoberfläche Schalung · fresh concrete pour close up",
};

export const PHOTO_NETWORK: PhotoSlot = {
  src: "",
  alt: "Gestapelte Bewehrungsmatten auf einer Baustelle, von oben",
  search: "rebar stack top view · Bewehrungsmatten gestapelt · steel reinforcement mesh pile",
};
