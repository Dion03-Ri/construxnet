import { Building2 } from "lucide-react";
import CockpitPlaceholder from "@/components/CockpitPlaceholder";

export const metadata = { title: "Bauunternehmer · ConstruxNet" };

export default function BuyerPage() {
  return (
    <CockpitPlaceholder
      icon={Building2}
      title="Bauunternehmer-Cockpit"
      subtitle="Pools beitreten, Tier-Fortschritt verfolgen und Lieferungen abwickeln."
      planned={[
        {
          title: "Aktive Pool-Teilnahmen",
          text: "Übersicht laufender Smart Pools mit Tier-Fortschrittsbalken.",
        },
        {
          title: "Paket-Koppelung",
          text: "Status-Indikatoren für gekoppelte Beton-/Stahl-Bestellungen.",
        },
        {
          title: "Lieferschein-OCR",
          text: "Lieferscheine per Foto erfassen und automatisch abgleichen.",
        },
        {
          title: "SIA-118 Verträge & Rechnungen",
          text: "Vertrags- und Rechnungsübersicht pro abgeschlossenem Pool.",
        },
      ]}
    />
  );
}
