import { Factory } from "lucide-react";
import CockpitPlaceholder from "@/components/CockpitPlaceholder";

export const metadata = { title: "Lieferant · ConstruxNet" };

export default function SupplierPage() {
  return (
    <CockpitPlaceholder
      icon={Factory}
      title="Lieferanten-Cockpit"
      subtitle="Regionale Bündel-Ausschreibungen einsehen und Sealed-Bid-Gebote abgeben."
      planned={[
        {
          title: "Bündel-Bidding-Feed",
          text: "Regionale Ausschreibungen mit Sealed-Bid-Gebotsabgabe.",
        },
        {
          title: "Kapazitätsplanung",
          text: "Dispositions- und Routenübersicht für zugesprochene Volumen.",
        },
        {
          title: "Provisionsübersicht",
          text: "Monatliche Plattformkommission (2.25 %) pro Auftrag.",
        },
        {
          title: "Auftragshistorie",
          text: "Gewonnene und verlorene Bündel im Überblick.",
        },
      ]}
    />
  );
}
