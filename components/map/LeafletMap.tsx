"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapPoint = {
  id: string;
  name: string;
  city: string | null;
  canton: string | null;
  verified: boolean;
  lat: number;
  lng: number;
};

// Gold-/Navy-Marker als DivIcon (kein Abhängen von Leaflet-Bildassets).
function markerIcon(verified: boolean) {
  const ring = verified ? "#D99000" : "#254D7A";
  return L.divIcon({
    className: "",
    html: `<span style="
      display:block;width:18px;height:18px;border-radius:999px;
      background:${ring};border:3px solid #fff;
      box-shadow:0 0 0 2px rgba(217,144,0,.25),0 2px 6px rgba(15,23,42,.35);
    "></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
}

// Die Schweiz plus ein schmaler Rand. Die Karte ist ein Werkzeug für den
// Schweizer Baustoffmarkt — Wegziehen nach Sibirien hilft niemandem.
const CH_BOUNDS: [[number, number], [number, number]] = [
  [45.7, 5.8],
  [47.9, 10.6],
];

export default function LeafletMap({
  points,
  height = 340,
}: {
  points: MapPoint[];
  height?: number;
}) {
  return (
    <MapContainer
      center={[46.83, 8.23]}
      zoom={7}
      minZoom={7}
      maxZoom={14}
      maxBounds={CH_BOUNDS}
      maxBoundsViscosity={1}
      scrollWheelZoom={false}
      style={{ height, width: "100%", background: "#EAF0F6" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={markerIcon(p.verified)}>
          <Popup>
            <div style={{ fontWeight: 700, color: "#0F172A" }}>
              {p.name} {p.verified ? "✓" : ""}
            </div>
            <div style={{ fontSize: 12, color: "#64748B" }}>
              {[p.city, p.canton].filter(Boolean).join(" · ") || "Standort offen"}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
