import { useState, useEffect, useRef } from "react";

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export interface LocationResult {
  name: string;
  lat: number;
  lng: number;
}

export function useLocationSearch(query: string) {
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
          { headers: { "User-Agent": "TravelMate/1.0" } }
        );
        if (!res.ok) throw new Error("Search failed");
        const data: NominatimResult[] = await res.json();
        setResults(
          data.map((d) => ({
            name: d.display_name,
            lat: parseFloat(d.lat),
            lng: parseFloat(d.lon),
          }))
        );
      } catch (err: any) {
        setError(err.message || "Search failed");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return { results, isLoading, error };
}
