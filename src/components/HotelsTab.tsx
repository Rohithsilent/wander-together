import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Hotel, ThumbsUp, ExternalLink, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchNearbyHotels,
  toggleHotelVote,
  subscribeToHotelVotes,
  updateSelectedHotel,
  calcDistanceKm,
  type Hotel as HotelType,
  type HotelVote,
} from "@/services/hotelService";

interface HotelsTabProps {
  groupId: string;
  userId: string;
  places: Array<{ name: string; lat: number; lng: number }>;
  destination: string;
  isMember: boolean;
}

const HotelsTab = ({ groupId, userId, places, destination, isMember }: HotelsTabProps) => {
  const { toast } = useToast();
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [votes, setVotes] = useState<Record<string, HotelVote>>({});
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [votingId, setVotingId] = useState<string | null>(null);
  const cacheRef = useRef<HotelType[] | null>(null);

  const refPlace = places?.[0];

  // Subscribe to votes and rebuild hotel list from votes if not fetched
  useEffect(() => {
    const unsub = subscribeToHotelVotes(groupId, (newVotes) => {
      setVotes(newVotes);
      // If hotels haven't been fetched from Overpass, reconstruct from votes
      if (!cacheRef.current && Object.keys(newVotes).length > 0) {
        const votedHotels: HotelType[] = Object.values(newVotes).map((v) => ({
          id: v.hotelId,
          name: v.hotelName,
          lat: 0,
          lng: 0,
        }));
        setHotels(votedHotels);
      }
    });
    return () => unsub();
  }, [groupId]);

  // Update selected hotel when votes change
  useEffect(() => {
    const entries = Object.values(votes);
    if (entries.length === 0) return;
    const top = entries.reduce((best, v) =>
      (v.votes?.length || 0) > (best.votes?.length || 0) ? v : best
    );
    if (top.votes?.length > 0) {
      updateSelectedHotel(groupId, {
        hotelId: top.hotelId,
        hotelName: top.hotelName,
        voteCount: top.votes.length,
      });
    }
  }, [votes, groupId]);

  const handleFetch = useCallback(async () => {
    if (!refPlace) {
      toast({ title: "No itinerary", description: "Add at least one itinerary place first.", variant: "destructive" });
      return;
    }
    if (cacheRef.current) {
      setHotels(cacheRef.current);
      return;
    }
    setLoading(true);
    try {
      const results = await fetchNearbyHotels(refPlace.lat, refPlace.lng);
      cacheRef.current = results;
      setHotels(results);
      setFetched(true);
      if (results.length === 0) {
        toast({ title: "No hotels found", description: "Try a different itinerary location." });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [refPlace, toast]);

  const handleVote = async (hotel: HotelType) => {
    setVotingId(hotel.id);
    try {
      await toggleHotelVote(groupId, hotel, userId);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setVotingId(null);
    }
  };

  const openBooking = () => {
    window.open(
      `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}`,
      "_blank"
    );
  };

  // Sort hotels by vote count desc
  const sortedHotels = [...hotels].sort((a, b) => {
    const va = votes[a.id]?.votes?.length || 0;
    const vb = votes[b.id]?.votes?.length || 0;
    return vb - va;
  });

  // Find top voted hotel id
  const topHotelId = sortedHotels.length > 0 && (votes[sortedHotels[0].id]?.votes?.length || 0) > 0
    ? sortedHotels[0].id
    : null;

  return (
    <div className="space-y-6">
      {/* Selected Hotel Banner */}
      {topHotelId && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Group Selected Hotel</p>
              <p className="font-bold text-foreground">{votes[topHotelId]?.hotelName}</p>
            </div>
          </div>
          <Badge className="bg-primary text-primary-foreground">
            {votes[topHotelId]?.votes?.length} vote{votes[topHotelId]?.votes?.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      )}

      {/* Fetch Button */}
      {!fetched && (
        <div className="bg-card rounded-2xl border shadow-card p-8 text-center space-y-4">
          <Hotel className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="font-bold text-foreground mb-1">Find Nearby Hotels</h3>
            <p className="text-sm text-muted-foreground">
              {refPlace
                ? `Search hotels near ${refPlace.name.split(",")[0]}`
                : "Add an itinerary location first to search hotels"}
            </p>
          </div>
          <Button onClick={handleFetch} disabled={loading || !refPlace} variant="hero">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Hotel className="h-4 w-4 mr-2" />}
            Fetch Hotels
          </Button>
        </div>
      )}

      {/* Loading */}
      {loading && fetched && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Hotel List */}
      {fetched && !loading && hotels.length === 0 && (
        <div className="bg-card rounded-2xl border shadow-card p-8 text-center">
          <p className="text-muted-foreground">No hotels found nearby. Try a different location.</p>
          <Button variant="outline" className="mt-4" onClick={() => { cacheRef.current = null; setFetched(false); }}>
            Try Again
          </Button>
        </div>
      )}

      {sortedHotels.length > 0 && (
        <div className="space-y-3">
          {sortedHotels.map((hotel) => {
            const voteData = votes[hotel.id];
            const voteCount = voteData?.votes?.length || 0;
            const hasVoted = voteData?.votes?.includes(userId);
            const isTop = hotel.id === topHotelId;
            const dist = refPlace && hotel.lat !== 0 && hotel.lng !== 0 ? calcDistanceKm(refPlace.lat, refPlace.lng, hotel.lat, hotel.lng) : null;

            return (
              <div
                key={hotel.id}
                className={`bg-card rounded-xl border shadow-card p-4 flex items-center justify-between transition-all ${
                  isTop ? "ring-2 ring-primary border-primary/30" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {isTop && <Trophy className="h-4 w-4 text-primary shrink-0" />}
                    <p className="font-semibold text-foreground truncate">{hotel.name}</p>
                  </div>
                  {dist !== null && (
                    <p className="text-xs text-muted-foreground mt-0.5">{dist.toFixed(1)} km away</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {voteCount > 0 && (
                    <Badge variant={isTop ? "default" : "secondary"} className="text-xs">
                      {voteCount}
                    </Badge>
                  )}
                  {isMember && (
                    <Button
                      size="sm"
                      variant={hasVoted ? "default" : "outline"}
                      onClick={() => handleVote(hotel)}
                      disabled={votingId === hotel.id}
                      className="gap-1"
                    >
                      {votingId === hotel.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <ThumbsUp className="h-3 w-3" />
                      )}
                      {hasVoted ? "Voted" : "Vote"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book Now */}
      {fetched && (
        <div className="bg-card rounded-2xl border shadow-card p-5 text-center space-y-3">
          <p className="text-sm text-muted-foreground">Ready to book? Search on Booking.com</p>
          <Button variant="hero" onClick={openBooking} className="gap-2">
            <ExternalLink className="h-4 w-4" /> Book Now on Booking.com
          </Button>
        </div>
      )}
    </div>
  );
};

export default HotelsTab;
