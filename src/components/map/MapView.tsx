import { useEffect, useRef } from "react";
import L from "leaflet";
import type { Place } from "@/types/itinerary";
import "leaflet/dist/leaflet.css";

function createNumberedIcon(index: number) {
  return L.divIcon({
    className: "numbered-marker",
    html: `<div class="pin"><div class="pin-head"><span class="pin-number">${index + 1}</span></div><div class="pin-shadow"></div></div>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
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

    // Clear existing markers & polylines
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Add markers
    places.forEach((place, i) => {
      L.marker([place.lat, place.lng], { icon: createNumberedIcon(i) }).addTo(map);
    });

    // Draw route polyline
    if (places.length > 1) {
      const latlngs = places.map((p) => [p.lat, p.lng] as L.LatLngExpression);
      L.polyline(latlngs, {
        color: "hsl(180, 93%, 32%)",
        weight: 3,
        opacity: 0.8,
        dashArray: "8, 6",
      }).addTo(map);
    }

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
