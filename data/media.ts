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
