

# Multi-Location Itinerary Mapping with OpenStreetMap

## Overview
Add an interactive map-based itinerary planner to the Create Group and Group Detail pages using OpenStreetMap (Leaflet + React-Leaflet). Users will search for places via Nominatim, add them to an ordered itinerary, visualize them on a map, and save them to Firestore.

---

## New Dependencies
- `leaflet` -- map rendering engine
- `react-leaflet` -- React wrapper for Leaflet
- `@types/leaflet` -- TypeScript types (dev dependency)

---

## New Files to Create

### 1. `src/types/itinerary.ts`
Shared type definition:
```typescript
interface Place {
  name: string;
  lat: number;
  lng: number;
}
```

### 2. `src/hooks/useLocationSearch.ts`
Custom hook for Nominatim API search:
- Accepts a search query string
- Debounces input (300ms) to avoid API spam
- Calls `https://nominatim.openstreetmap.org/search?format=json&q=...`
- Returns `{ results, isLoading, error }` state
- Handles empty queries and error states

### 3. `src/components/map/MultiLocationPicker.tsx`
Interactive picker used on the Create Group page:
- Location search input with dropdown suggestions (from `useLocationSearch`)
- "Add Place" button to append selected place to the list
- Duplicate prevention (by lat/lng match)
- Ordered list of selected places with remove buttons
- Embedded Leaflet map (400px height) showing numbered markers
- Auto-fits map bounds to include all markers
- Uses `React.lazy` for the map portion to enable code splitting

### 4. `src/components/map/ItineraryMap.tsx`
Read-only map display used on the Group Detail page:
- Renders all places as numbered markers
- Auto-zooms to fit all markers
- Below the map, shows an ordered list of place names
- Handles empty/missing `places` array gracefully (shows "No itinerary added" message)
- Also lazy-loaded

### 5. `src/components/map/MapContainer.tsx`
Thin wrapper around React-Leaflet's MapContainer that:
- Imports Leaflet CSS
- Sets OpenStreetMap tile layer URL
- Handles the `invalidateSize` fix for dynamic containers
- Provides the auto-fit-bounds logic via a child component that watches the markers array

---

## Files to Modify

### 6. `src/services/firestore.ts`
- Add `places?: Place[]` to the `GroupData` interface
- No other changes needed -- `createGroup` already spreads `...data`, so the places array flows through automatically

### 7. `src/pages/CreateGroup.tsx`
- Add `places: []` to the form state
- Import and render `MultiLocationPicker` below the destination input
- Pass `places` and `setPlaces` as props
- Add validation: require at least 1 place before submission
- Include `places` in the `createGroup()` call

### 8. `src/pages/GroupDetail.tsx`
- In the "Details" tab, add a "Trip Map" section above "About this trip"
- Import and render `ItineraryMap` with `group.places`
- Conditionally render only if `group.places?.length > 0`

### 9. `src/index.css`
- Add Leaflet CSS import: `@import "leaflet/dist/leaflet.css";`
- Add custom styles for numbered markers (small teal circles with white numbers)

---

## Technical Details

**Nominatim API usage**: The hook will include a `User-Agent` header as required by Nominatim's usage policy. Search is debounced at 300ms.

**Numbered markers**: Custom Leaflet `DivIcon` with a teal circle background and the place's order number (1, 2, 3...) rendered as white text.

**Lazy loading**: Both map components will be wrapped with `React.lazy()` and `Suspense` with a loading spinner fallback to avoid loading Leaflet on pages that don't need it.

**Backward compatibility**: The `places` field is optional in `GroupData`. The Group Detail page checks `group.places?.length` before rendering the map section. Existing groups without places will display normally.

**Map bounds**: A helper component inside the map watches the places array and calls `map.fitBounds()` whenever it changes, with some padding.

