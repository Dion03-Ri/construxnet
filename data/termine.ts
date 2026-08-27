// Termine & Ausschreibungen. Datumsangaben als Tages-Offset ab heute, damit die
// Liste immer in der Zukunft liegt (Demo-Daten ohne Backend).

export type TerminType = "Ausschreibung" | "Sealed-Bid" | "Pool-Deadline" | "Netzwerk-Event";

export type Termin = {
  id: string;
  title: string;
  type: TerminType;
  inDays: number; // Tage ab heute
  hour: number; // Startstunde (lokal)
  durationH: number;
  region: string;
  location: string;
  description: string;
  href?: string;
};

export const TERMINE: Termin[] = [
  { id: "t1", title: "Sammelphase-Ende · Beton C25/30 Limmattal", type: "Pool-Deadline", inDays: 2, hour: 12, durationH: 1, region: "Zürich", location: "Online / ConstruxNet", description: "Letzter Beitritt zum Beton-Pool bevor die Sealed-Bid-Phase startet. Aktuelles Volumen 230 m³.", href: "/pools" },
  { id: "t2", title: "Sealed-Bid Zuschlag · Wandkies Nordwestschweiz", type: "Sealed-Bid", inDays: 1, hour: 10, durationH: 1, region: "Nordwestschweiz", location: "Online / ConstruxNet", description: "Verbindliche Angebotsabgabe der Lieferanten; günstigster Bid ggü. KBOB erhält den Zuschlag.", href: "/pools" },
  { id: "t3", title: "Ausschreibung · Armierungsstahl B500B Bern", type: "Ausschreibung", inDays: 5, hour: 9, durationH: 2, region: "Bern", location: "Bern-West", description: "Neue Sammel-Ausschreibung für 48 t Armierungsstahl. Bedarf melden und beitreten.", href: "/pools" },
  { id: "t4", title: "Branchen-Apéro · Baustoffwerke & Bauunternehmen", type: "Netzwerk-Event", inDays: 12, hour: 17, durationH: 3, region: "Zürich", location: "Zürich-Oerlikon", description: "Netzwerk-Anlass zum Kennenlernen möglicher Bündel-Partner in der Region Zürich.", href: "/network" },
  { id: "t5", title: "Sammelphase-Ende · Dämmung EPS 034 Ostschweiz", type: "Pool-Deadline", inDays: 8, hour: 12, durationH: 1, region: "Ostschweiz", location: "Online / ConstruxNet", description: "Pool für 3'000 m² Dämmung — noch offen für weitere Teilnehmer.", href: "/pools" },
  { id: "t6", title: "Ausschreibung · Transportbeton Westschweiz Q4", type: "Ausschreibung", inDays: 15, hour: 9, durationH: 2, region: "Westschweiz", location: "Lausanne", description: "Quartals-Ausschreibung Transportbeton C25/30 für mehrere Baustellen.", href: "/pools" },
];
