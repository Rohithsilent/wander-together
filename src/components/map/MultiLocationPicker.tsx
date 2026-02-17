import { useState, lazy, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import { Search, X, MapPin, Loader2 } from "lucide-react";
import type { Place } from "@/types/itinerary";

const MapView = lazy(() => import("@/components/map/MapView"));

interface MultiLocationPickerProps {
  places: Place[];
  onChange: (places: Place[]) => void;
}

export default function MultiLocationPicker({ places, onChange }: MultiLocationPickerProps) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const { results, isLoading } = useLocationSearch(query);

  const addPlace = (result: { name: string; lat: number; lng: number }) => {
    const isDuplicate = places.some(
      (p) => Math.abs(p.lat - result.lat) < 0.0001 && Math.abs(p.lng - result.lng) < 0.0001
    );
    if (isDuplicate) return;
    const newPlace: Place = {
      id: crypto.randomUUID(),
      name: result.name,
      lat: result.lat,
      lng: result.lng,
    };
    onChange([...places, newPlace]);
    setQuery("");
    setShowDropdown(false);
  };

  const removePlace = (index: number) => {
    onChange(places.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          Trip Itinerary – Places to Visit
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for a place..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="pl-9"
          />
          {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}

          {showDropdown && results.length > 0 && (
            <div className="absolute z-50 mt-1 w-full bg-popover border rounded-lg shadow-elevated max-h-48 overflow-y-auto">
              {results.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted transition-colors flex items-start gap-2"
                  onClick={() => addPlace(r)}
                >
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                  <span className="text-popover-foreground line-clamp-2">{r.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {places.length > 0 && (
        <>
          <div className="space-y-2">
            {places.map((place, i) => (
              <div key={i} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground flex-1 truncate">{place.name}</span>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => removePlace(i)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>

          <Suspense fallback={<div className="h-[400px] bg-muted rounded-xl flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
            <MapView places={places} />
          </Suspense>
        </>
      )}
    </div>
  );
}
