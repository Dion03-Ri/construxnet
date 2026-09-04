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
/* Herkunft und Lizenz der abgelegten Bilder — bitte pflegen, sobald weitere
   dazukommen. Alle von Pexels, freie kommerzielle Nutzung, keine
   Namensnennung nötig (Pexels-Lizenz). Vor dem Ablegen auf 1700–2400 px
   verkleinert, mozjpeg:
     /hero-kran.jpg   Kran bei Nacht          — Tima Miroshnichenko
     /mat-lager.jpg   Materiallager von oben  — Maarten Ceulemans
     /logistik.jpg    Umschlagplatz von oben  — Marcin Jozwiak
     /baugrube.jpg    Baugrube mit Bohrpfählen — Wolfgang Weiser
   Aussortiert und nicht abgelegt: ein weisser KI-Render (kein Bezug zum Bau),
   eine Luftaufnahme voller grüner Schutznetze (Farbregel) und eine generische
   Kranlandschaft mit matschigem Vordergrund. */
export type PhotoSlot = {
  /** Pfad unter /public, sobald ein Bild vorliegt. Leer = Platzhalter. */
  src: string;
  /** Was auf dem Bild zu sehen sein soll — auch der Alt-Text. */
  alt: string;
  /** Suchbegriffe für Unsplash, Pexels oder Adobe Stock. */
  search: string;
};

export const PHOTO_POOLS: PhotoSlot = {
  src: "/mat-lager.jpg",
  alt: "Materiallager von oben: gestapelte Betonelemente und Stahlprofile",
  search: "material yard aerial · Betonelemente gestapelt · precast storage top view",
};

export const PHOTO_NETWORK: PhotoSlot = {
  src: "/logistik.jpg",
  alt: "Umschlagplatz von oben: Lastwagen an den Verladerampen einer Halle",
  search: "logistics hub aerial · Verladerampe Lastwagen · distribution centre top view",
};

/** Noch ungenutzt, aber geprüft und in der richtigen Grösse abgelegt:
 *  Baugrube mit Bohrpfählen. Vorgesehen für die KBOB- oder Beschaffungsseite. */
export const PHOTO_EXCAVATION: PhotoSlot = {
  src: "/baugrube.jpg",
  alt: "Baugrube mit freigelegten Bohrpfählen, Spundwand im Hintergrund",
  search: "excavation bored piles · Baugrube Bohrpfähle · foundation pit",
};

/* ==================================================================
   HERO-BILD
   ------------------------------------------------------------------
   Der Kopf der Startseite ist bewusst ein STANDBILD, kein Video.

   Es gab einen Versuch mit bewegtem Hintergrund; die Bewegung wirkte
   unruhig und lenkte von der Ueberschrift ab. Die Adresse des Videos
   steht unten, falls das je wieder gefragt ist — ein Standbild an
   dieser Stelle ist aber die ruhigere und schnellere Loesung, und es
   gibt nichts, was erst geladen werden muss.
   ================================================================== */
export const HERO_IMAGE = "/hero-kran.jpg";

/** Nicht in Gebrauch. Aufbewahrt, damit die Adresse nicht verlorengeht,
 *  falls der Kopf doch einmal wieder bewegt sein soll. */
export const HERO_VIDEO_URL_UNUSED =
  "https://6lqwc1k8pyo1qnqz.public.blob.vercel-storage.com/7169070-uhd_3840_2160_25fps.mp4";
