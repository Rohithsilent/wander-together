import { lazy, Suspense } from "react";
import { MapPin, Loader2 } from "lucide-react";
import type { Place } from "@/types/itinerary";

const MapView = lazy(() => import("@/components/map/MapView"));

interface ItineraryMapProps {
  places?: Place[];
}

export default function ItineraryMap({ places }: ItineraryMapProps) {
  if (!places || places.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl border shadow-card p-6 space-y-4">
      <h3 className="font-bold text-foreground flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        Trip Map
      </h3>

      <Suspense fallback={<div className="h-[400px] bg-muted rounded-xl flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
        <MapView places={places} />
      </Suspense>

      <div className="space-y-2">
        {places.map((place, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <span className="text-sm text-foreground">{place.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
