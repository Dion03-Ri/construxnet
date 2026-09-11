/**
 * Die Abo-Stufen — eine Quelle für Preisabschnitt, Kontoseite und Grenzen.
 *
 * 0 / 129 / 489 CHF pro Monat — vom Betreiber am 09.09.2026 festgelegt.
 * Zuvor standen hier Platzhalter (0 / 79 / 189).
 *
 * Diese Datei bleibt die einzige Quelle: Preisabschnitt der Startseite und
 * Kontoseite lesen daraus. Keine dieser Zahlen darf irgendwo im Fliesstext
 * stehen, sonst steht sie beim naechsten Wechsel an zwei Orten.
 *
 * Nicht davon beruehrt: die Rabattstaffel der Buendelung. Sie hat mit den
 * Abos nichts zu tun und steht seit Migration 43 in der Tabelle
 * `rabattstufen` — nicht im Quelltext.
 */

export type PlanKey = "FREE" | "PRO" | "ENTERPRISE";

export type Plan = {
  key: PlanKey;
  name: string;
  /** CHF pro Monat, 0 = kostenlos. Siehe Kopf. */
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
    price: 129,
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
    price: 489,
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
