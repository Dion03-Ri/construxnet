import { Gauge } from "lucide-react";
import CockpitPlaceholder from "@/components/CockpitPlaceholder";

export const metadata = { title: "Admin · ConstruxNet" };

export default function AdminPage() {
  return (
    <CockpitPlaceholder
      icon={Gauge}
      title="Admin / Gap-Closer Control Center"
      subtitle="Pools nahe der nächsten Rabattschwelle überwachen und gezielt aktivieren."
      planned={[
        {
          title: "Pools nahe Schwelle",
          text: "Aktive Pools bei 90–95 % zur nächsten Tier-Stufe.",
        },
        {
          title: "Gap-Closer Alerts",
          text: "One-Click-Benachrichtigung an Schlüssellieferanten.",
        },
        {
          title: "Plattform-Kennzahlen",
          text: "Volumen, Abschlüsse und Kommissionen im Überblick.",
        },
        {
          title: "Pool-Verwaltung",
          text: "Deadlines, Regionen und Tier-Ziele konfigurieren.",
        },
      ]}
    />
  );
}
