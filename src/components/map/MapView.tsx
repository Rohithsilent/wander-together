import { useEffect, useRef } from "react";
import L from "leaflet";
import type { Place } from "@/types/itinerary";
import "leaflet/dist/leaflet.css";

function createNumberedIcon(index: number) {
  return L.divIcon({
    className: "numbered-marker",
    html: `<span>${index + 1}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

interface MapViewProps {
  places: Place[];
  height?: string;
}

export default function MapView({ places, height = "400px" }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const center: L.LatLngExpression = places.length > 0
      ? [places[0].lat, places[0].lng]
      : [20, 0];

    const map = L.map(containerRef.current).setView(center, 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    // Add new markers
    places.forEach((place, i) => {
      L.marker([place.lat, place.lng], { icon: createNumberedIcon(i) }).addTo(map);
    });

    // Fit bounds
    if (places.length === 1) {
      map.setView([places[0].lat, places[0].lng], 13);
    } else if (places.length > 1) {
      const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng] as L.LatLngExpression));
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    setTimeout(() => map.invalidateSize(), 100);
  }, [places]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: "100%", borderRadius: "var(--radius)" }}
    />
  );
}
