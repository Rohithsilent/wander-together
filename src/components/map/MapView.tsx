import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
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

function FitBounds({ places }: { places: Place[] }) {
  const map = useMap();

  useEffect(() => {
    if (places.length === 0) return;
    if (places.length === 1) {
      map.setView([places[0].lat, places[0].lng], 13);
    } else {
      const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [places, map]);

  useEffect(() => {
    // Fix for dynamic containers
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);

  return null;
}

interface MapViewProps {
  places: Place[];
  height?: string;
}

export default function MapView({ places, height = "400px" }: MapViewProps) {
  const center: [number, number] = places.length > 0
    ? [places[0].lat, places[0].lng]
    : [20, 0];

  return (
    <MapContainer
      center={center}
      zoom={2}
      style={{ height, width: "100%", borderRadius: "var(--radius)" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {places.map((place, i) => (
        <Marker key={`${place.lat}-${place.lng}-${i}`} position={[place.lat, place.lng]} icon={createNumberedIcon(i)} />
      ))}
      <FitBounds places={places} />
    </MapContainer>
  );
}
