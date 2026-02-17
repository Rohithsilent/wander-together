import { useState, useRef, lazy, Suspense, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import { updateGroupPlaces } from "@/services/firestore";
import { Search, X, MapPin, Loader2, GripVertical } from "lucide-react";
import type { Place } from "@/types/itinerary";

const MapView = lazy(() => import("@/components/map/MapView"));

interface ItineraryMapProps {
  groupId: string;
  places: Place[];
  isMember: boolean;
  onPlacesChange: (places: Place[]) => void;
}

export default function ItineraryMap({ groupId, places, isMember, onPlacesChange }: ItineraryMapProps) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const { results, isLoading } = useLocationSearch(query);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const persist = useCallback(
    async (updated: Place[]) => {
      onPlacesChange(updated);
      try {
        await updateGroupPlaces(groupId, updated);
      } catch (err) {
        console.error("Failed to save places:", err);
      }
    },
    [groupId, onPlacesChange]
  );

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
    persist([...places, newPlace]);
    setQuery("");
    setShowDropdown(false);
  };

  const removePlace = (index: number) => {
    persist(places.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverItem.current = index;
  };

  const handleDrop = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;

    const updated = [...places];
    const [dragged] = updated.splice(dragItem.current, 1);
    updated.splice(dragOverItem.current, 0, dragged);
    dragItem.current = null;
    dragOverItem.current = null;
    persist(updated);
  };

  return (
    <div className="bg-card rounded-2xl border shadow-card p-6 space-y-4">
      <h3 className="font-bold text-foreground flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        Trip Itinerary
      </h3>

      {/* Search Bar (members only) */}
      {isMember && (
        <div className="relative z-[1000]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for a destination..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            className="pl-9"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}

          {showDropdown && results.length > 0 && (
            <div className="absolute z-50 mt-1 w-full bg-popover border rounded-lg shadow-elevated max-h-48 overflow-y-auto">
              {results.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted transition-colors flex items-start gap-2"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addPlace(r)}
                >
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                  <span className="text-popover-foreground line-clamp-2">{r.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Map */}
      {places.length > 0 && (
        <Suspense
          fallback={
            <div className="h-[400px] bg-muted rounded-xl flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          }
        >
          <MapView places={places} />
        </Suspense>
      )}

      {/* Draggable Places List */}
      {places.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {isMember ? "Drag to reorder stops" : "Planned stops"}
          </p>
          {places.map((place, i) => (
            <div
              key={place.id || i}
              draggable={isMember}
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={handleDrop}
              className={`flex items-center gap-2 bg-muted rounded-lg px-3 py-2 transition-all ${isMember ? "cursor-grab active:cursor-grabbing hover:bg-muted/80 drag-item" : ""
                }`}
            >
              {isMember && (
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span className="text-sm text-foreground flex-1 truncate">{place.name}</span>
              {isMember && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => removePlace(i)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {places.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <MapPin className="h-10 w-10 text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">
            {isMember
              ? "No destinations yet. Search above to add your first stop!"
              : "No destinations have been added to this trip yet."}
          </p>
        </div>
      )}
    </div>
  );
}
