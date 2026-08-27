import {
  Package,
  TrendingUp,
  Tag,
  UserPlus,
  Gavel,
  ShieldCheck,
  MessageSquare,
  Truck,
  type LucideIcon,
} from "lucide-react";

export type NoticeCat = "pool" | "offer" | "network";

export type Notice = {
  id: string;
  cat: NoticeCat;
  icon: LucideIcon;
  tone: string; // Klassen für Icon-Chip
  actor: string; // wer / was (fett hervorgehoben)
  text: string; // restlicher Text
  time: string;
  href: string;
};

export const NOTICES: Notice[] = [
  { id: "n1", cat: "pool", icon: TrendingUp, tone: "text-brand bg-brand/10", actor: "Beton C25/30 · Zürich", text: "hat Tier 2 erreicht — der Rabatt liegt jetzt bei −12 %.", time: "vor 12 Min.", href: "/pools" },
  { id: "n2", cat: "network", icon: UserPlus, tone: "text-accent bg-accent-50", actor: "Gebr. Meier Hochbau AG", text: "möchte sich mit dir vernetzen — möglicher Bündel-Partner in Bern.", time: "vor 40 Min.", href: "/network" },
  { id: "n3", cat: "offer", icon: Tag, tone: "text-accent bg-accent-50", actor: "Vigier Beton Mittelland", text: "hat ein Angebot gesendet: 145.20 CHF/m³ für 230 m³ Beton C25/30.", time: "vor 1 Std.", href: "/messages" },
  { id: "n4", cat: "pool", icon: Package, tone: "text-brand bg-brand/10", actor: "KIBAG Baustoffe", text: "ist deinem Pool „Beton C25/30 · Limmattal“ beigetreten.", time: "vor 3 Std.", href: "/pools" },
  { id: "n5", cat: "network", icon: ShieldCheck, tone: "text-accent bg-accent-50", actor: "Toggenburger Kies AG", text: "wurde als Lieferant verifiziert (CHE geprüft).", time: "vor 5 Std.", href: "/network" },
  { id: "n6", cat: "pool", icon: Gavel, tone: "text-brand bg-brand/10", actor: "Kies 0/45 · Nordwestschweiz", text: "geht in 2 Tagen in die Sealed-Bid-Phase — jetzt Bedarf einbringen.", time: "gestern", href: "/pools" },
  { id: "n7", cat: "offer", icon: MessageSquare, tone: "text-accent bg-accent-50", actor: "Eberhard Bau AG", text: "hat dir eine Nachricht zum Armierungsstahl-Bündel geschrieben.", time: "gestern", href: "/messages" },
  { id: "n8", cat: "network", icon: Truck, tone: "text-slate-600 bg-slate-100", actor: "3 neue Baustoffwerke", text: "in deiner Region (ZH) sind ConstruxNet beigetreten.", time: "vor 2 T.", href: "/network" },
];

export const NOTICE_TABS: { key: "all" | NoticeCat; label: string }[] = [
  { key: "all", label: "Alle" },
  { key: "pool", label: "Pool-Updates" },
  { key: "offer", label: "Angebote & Nachrichten" },
  { key: "network", label: "Netzwerk" },
];
