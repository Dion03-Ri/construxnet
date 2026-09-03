"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapPoint = {
  id: string;
  name: string;
  city: string | null;
  canton: string | null;
  verified: boolean;
  role: string;
  lat: number;
  lng: number;
  /** true = echte Koordinaten, false = grobe Einordnung nach Ort/Kanton. */
  exact: boolean;
  /** Adresse hinter dem Punkt, sofern ermittelt. */
  label?: string | null;
};

// Gold für Baustoffwerke, Navy für Bauunternehmen. Ein Ring markiert
// verifizierte Firmen; grobe Punkte bleiben blass, damit man sie nicht mit
// einer echten Adresse verwechselt.
function markerIcon(p: MapPoint) {
  const fill = p.role === "SUPPLIER" ? "#D99000" : "#254D7A";
  const size = p.verified ? 20 : 16;
  return L.divIcon({
    className: "",
    html: `<span style="
      display:block;width:${size}px;height:${size}px;border-radius:999px;
      background:${fill};border:3px solid #fff;opacity:${p.exact ? 1 : 0.6};
      box-shadow:0 0 0 ${p.verified ? 3 : 2}px rgba(217,144,0,${p.verified ? 0.35 : 0.2}),0 2px 6px rgba(15,23,42,.35);
    "></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 2],
  });
}

// Die Schweiz plus ein schmaler Rand. Die Karte ist ein Werkzeug für den
// Schweizer Baustoffmarkt — Wegziehen nach Sibirien hilft niemandem.
const CH_BOUNDS: [[number, number], [number, number]] = [
  [45.7, 5.8],
  [47.9, 10.6],
];

/** Zoomt auf die vorhandenen Punkte, sobald sich die Auswahl ändert. */
function FitToPoints({ points }: { points: MapPoint[] }) {
  const map = useMap();
  const key = points.map((p) => p.id).join(",");
  useEffect(() => {
    if (points.length === 0) {
      map.setView([46.83, 8.23], 7);
      return;
    }
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 11);
      return;
    }
    map.fitBounds(
      L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number])),
      { padding: [40, 40], maxZoom: 12 },
    );
    // Die Punktmenge ist über `key` erfasst; `points` selbst ist bei jedem
    // Rendern ein neues Feld und würde eine Endlosschleife auslösen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

export default function LeafletMap({
  points,
  height = 420,
}: {
  points: MapPoint[];
  height?: number;
}) {
  return (
    <MapContainer
      center={[46.83, 8.23]}
      zoom={7}
      minZoom={7}
      maxZoom={17}
      maxBounds={CH_BOUNDS}
      maxBoundsViscosity={1}
      scrollWheelZoom={false}
      style={{ height, width: "100%", background: "#EAF0F6" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToPoints points={points} />
      {points.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={markerIcon(p)}>
          <Popup>
            <div style={{ fontWeight: 700, color: "#0F172A" }}>
              {p.name} {p.verified ? "✓" : ""}
            </div>
            <div style={{ fontSize: 12, color: "#64748B" }}>
              {p.role === "SUPPLIER" ? "Baustoffwerk" : "Bauunternehmen"}
            </div>
            <div style={{ fontSize: 12, color: "#64748B" }}>
              {p.exact
                ? p.label || [p.city, p.canton].filter(Boolean).join(" · ")
                : `${[p.city, p.canton].filter(Boolean).join(" · ") || "Standort offen"} (ungefähr)`}
            </div>
            <a
              href={`/company/${p.id}`}
              style={{ display: "inline-block", marginTop: 6, fontSize: 12, fontWeight: 600, color: "#B37700" }}
            >
              Profil ansehen →
            </a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
