"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
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

// Eine Kartennadel mit dem Firmennamen daneben — kein blosser Punkt.
//
// Ein Punkt sagt „hier ist jemand" und sonst nichts: man muss jeden
// einzeln anklicken, um zu erfahren, wer es ist. Mit Namen an der Nadel
// liest man die Karte, statt sie abzuklicken.
//
// Die Nadelspitze sitzt genau auf der Koordinate. Deshalb `iconSize: [0,0]`
// und `iconAnchor: [0,0]`: Leaflet setzt die linke obere Ecke des Kastens
// auf den Punkt, und das Innere wird von dort aus nach oben und zur Seite
// gezeichnet. Mit einem festen Kasten müsste er so breit sein wie der
// längste Name — und würde die Nadel danebenrücken.
//
// Gold = Baustoffwerk, Navy = Bauunternehmen. Grobe Standorte bleiben
// blass, damit man sie nicht mit einer echten Adresse verwechselt.
function nadelIcon(p: MapPoint, mitNamen: boolean) {
  const farbe = p.role === "SUPPLIER" ? "#D99000" : "#254D7A";
  const blass = p.exact ? "" : " nadel--grob";

  // Spitze bei (12,32) im 24×32-Feld.
  const stift = `<svg width="24" height="32" viewBox="0 0 24 32" fill="none" aria-hidden="true">
      <path d="M12 31.2C12 31.2 22.4 18.2 22.4 11.4C22.4 5.66 17.74 1 12 1C6.26 1 1.6 5.66 1.6 11.4C1.6 18.2 12 31.2 12 31.2Z"
            fill="${farbe}" stroke="#ffffff" stroke-width="1.8" stroke-linejoin="round"/>
      ${
        p.verified
          ? `<path d="M8.2 11.5l2.6 2.6 5-5" stroke="#ffffff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>`
          : `<circle cx="12" cy="11.4" r="3.6" fill="#ffffff" opacity="0.95"/>`
      }
    </svg>`;

  const schild = mitNamen
    ? `<span class="nadel-schild" style="border-left-color:${farbe}">${escape(p.name)}</span>`
    : "";

  return L.divIcon({
    className: "nadel-huelle",
    html: `<span class="nadel${blass}">${stift}${schild}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -34],
  });
}

/** Firmennamen kommen aus der Datenbank und gehen in HTML — also escapen. */
function escape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Ab wann die Namen dazukommen.
 *
 * Auf der Übersicht über die ganze Schweiz lägen dreissig Namen
 * übereinander und man läse keinen einzigen. Bis dahin steht nur die
 * Nadel, und wer darüberfährt, bekommt den Namen als Hinweis.
 */
const ZOOM_MIT_NAMEN = 9;

function useZoomstufe() {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  useEffect(() => {
    const merke = () => setZoom(map.getZoom());
    map.on("zoomend", merke);
    return () => {
      map.off("zoomend", merke);
    };
  }, [map]);
  return zoom;
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

/** Die Nadeln selbst — eigene Komponente, weil sie die Zoomstufe braucht. */
function Nadeln({ points }: { points: MapPoint[] }) {
  const zoom = useZoomstufe();
  const mitNamen = zoom >= ZOOM_MIT_NAMEN;

  return (
    <>
      {points.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={nadelIcon(p, mitNamen)}
          riseOnHover
        >
          {/* Solange die Namen nicht an den Nadeln stehen, sagt der Hinweis,
              wer da ist — ohne dass man klicken muss. */}
          {!mitNamen && (
            <Tooltip direction="top" offset={[0, -30]} opacity={1}>
              {p.name}
            </Tooltip>
          )}
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
    </>
  );
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
      <Nadeln points={points} />
    </MapContainer>
  );
}
