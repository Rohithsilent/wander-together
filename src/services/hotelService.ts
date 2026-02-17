import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { fetchDestinationImage } from "@/services/imageService";

export interface Hotel {
  id: string;
  name: string;
  lat: number;
  lng: number;
  image?: string;
}

export interface HotelVote {
  hotelId: string;
  hotelName: string;
  votes: string[];
  createdAt: unknown;
}

// ==================== OVERPASS API ====================
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

export const fetchNearbyHotels = async (lat: number, lng: number): Promise<Hotel[]> => {
  const query = `
    [out:json][timeout:10];
    node["tourism"="hotel"](around:5000,${lat},${lng});
    out body 20;
  `;

  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (!res.ok) throw new Error("Failed to fetch hotels");

  const data = await res.json();

  const hotels = (data.elements || [])
    .filter((el: any) => el.tags?.name)
    .map((el: any) => ({
      id: String(el.id),
      name: el.tags.name,
      lat: el.lat,
      lng: el.lon,
    }));

  // Fetch images for each hotel from Unsplash
  console.log('🏨 Fetching images for', hotels.length, 'hotels');
  const hotelsWithImages = await Promise.all(
    hotels.map(async (hotel: Hotel) => {
      try {
        const image = await fetchDestinationImage(`${hotel.name} hotel`);
        return { ...hotel, image };
      } catch (error) {
        console.error(`Failed to fetch image for ${hotel.name}:`, error);
        return hotel; // Return hotel without image if fetch fails
      }
    })
  );

  console.log('✅ Hotels with images:', hotelsWithImages.length);
  return hotelsWithImages;
};

// ==================== HOTEL VOTES ====================
export const toggleHotelVote = async (
  groupId: string,
  hotel: Hotel,
  userId: string
) => {
  const voteRef = doc(db, "groups", groupId, "hotelVotes", hotel.id);
  const snap = await getDoc(voteRef);

  if (!snap.exists()) {
    await setDoc(voteRef, {
      hotelId: hotel.id,
      hotelName: hotel.name,
      votes: [userId],
      createdAt: serverTimestamp(),
    });
  } else {
    const votes: string[] = snap.data().votes || [];
    if (votes.includes(userId)) {
      await updateDoc(voteRef, { votes: arrayRemove(userId) });
    } else {
      await updateDoc(voteRef, { votes: arrayUnion(userId) });
    }
  }
};

export const subscribeToHotelVotes = (
  groupId: string,
  callback: (votes: Record<string, HotelVote>) => void
) => {
  return onSnapshot(collection(db, "groups", groupId, "hotelVotes"), (snapshot) => {
    const votes: Record<string, HotelVote> = {};
    snapshot.docs.forEach((d) => {
      const data = d.data() as HotelVote;
      votes[d.id] = data;
    });
    callback(votes);
  });
};

export const updateSelectedHotel = async (
  groupId: string,
  hotel: { hotelId: string; hotelName: string; voteCount: number } | null
) => {
  await updateDoc(doc(db, "groups", groupId), { selectedHotel: hotel });
};

// ==================== DISTANCE ====================
export const calcDistanceKm = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
