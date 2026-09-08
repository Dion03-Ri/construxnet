/**
 * Die Abo-Stufen — eine Quelle für Preisabschnitt, Kontoseite und Grenzen.
 *
 * ACHTUNG, PREISE SIND PLATZHALTER. 0 / 79 / 189 sind gesetzt, weil eine
 * Preisseite ohne Zahlen nicht baubar ist — sie sind nicht bestätigt.
 * Steht der Preis fest, wird er hier geändert und nirgends sonst; deshalb
 * darf keine Zahl aus dieser Datei irgendwo im Text stehen.
 */

export type PlanKey = "FREE" | "PRO" | "ENTERPRISE";

export type Plan = {
  key: PlanKey;
  name: string;
  /** Platzhalter, siehe oben. */
  price: number;
  unit?: string;
  note: string;
  features: string[];
  /**
   * Wie viele laufende Bündel gleichzeitig. `null` = ohne Grenze.
   *
   * ACHTUNG, ZWEITE STELLE: dieselben Zahlen stehen in der Tabelle
   * `plan_limits` (Migration 26). Diese Datei ZEIGT sie, die Tabelle
   * SETZT sie DURCH — eine Grenze, die nur der Browser kennt, ist keine.
   * Wer eine ändert, muss die andere mitändern.
   */
  poolLimit: number | null;
};

export const PLANS: Plan[] = [
  {
    key: "FREE",
    name: "Gratis",
    price: 0,
    note: "Für Firmen, die das Netzwerk kennenlernen.",
    poolLimit: 1,
    features: [
      "Firmenprofil mit CHE-Verifizierung",
      "Netzwerk, Verbindungen und Nachrichten",
      "KBOB-Referenzpreise ansehen",
      "Teilnahme an einem Smart Pool",
    ],
  },
  {
    key: "PRO",
    name: "Pro",
    price: 79,
    unit: "pro Monat",
    note: "Für Baufirmen, die regelmässig einkaufen.",
    poolLimit: null,
    features: [
      "Alles aus Gratis",
      "Unbegrenzt Smart Pools",
      "Eigene Ausschreibungen im Sealed-Bid",
      "Preisverlauf und eigene Abschlüsse",
      "SIA-118-Vertragswerk",
      "Lieferschein-Abgleich",
    ],
  },
  {
    key: "ENTERPRISE",
    name: "Enterprise",
    price: 189,
    unit: "pro Monat",
    note: "Für Gruppen mit mehreren Niederlassungen.",
    poolLimit: null,
    features: [
      "Alles aus Pro",
      "Mehrere Niederlassungen unter einem Konto",
      "KI-Materialabgleich für Ausschreibungen",
      "Schnittstelle zur eigenen ERP",
      "Fester Ansprechpartner",
    ],
  },
];

export function plan(key: PlanKey): Plan {
  return PLANS.find((p) => p.key === key) ?? PLANS[0];
}

/** Zustände, die die Datenbank kennt. */
export type SubscriptionStatus = "ACTIVE" | "PENDING_PAYMENT" | "PAST_DUE" | "CANCELLED";

export type Subscription = {
  id: string;
  company_id: string;
  plan: PlanKey;
  status: SubscriptionStatus;
  pending_plan: PlanKey | null;
  started_at: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  provider: "STRIPE" | null;
};

export const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  ACTIVE: "aktiv",
  PENDING_PAYMENT: "wartet auf Zahlung",
  PAST_DUE: "Zahlung offen",
  CANCELLED: "gekündigt",
};
