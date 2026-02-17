import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Search, Plus, MapPin, Calendar, DollarSign, Users, Loader2, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { getGroups, getGroupMembers } from "@/services/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import welcomeBg from "@/assets/download.jpg";

const fallbackImages = [
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&h=500&fit=crop",
];

interface GroupWithMembers {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  travelType: string;
  maxMembers: number;
  description: string;
  image?: string;
  memberCount: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const rawGroups = await getGroups();
        const groupsWithMembers = await Promise.all(
          rawGroups.map(async (g: any, i: number) => {
            const members = await getGroupMembers(g.id);
            return {
              id: g.id,
              destination: g.destination || "Unknown",
              startDate: g.startDate || "",
              endDate: g.endDate || "",
              budget: g.budget || "",
              travelType: g.travelType || "Leisure",
              maxMembers: g.maxMembers || 6,
              description: g.description || "",
              image: g.coverImage || g.image || fallbackImages[i % fallbackImages.length],
              memberCount: members.length,
            };
          })
        );
        setGroups(groupsWithMembers);
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const filtered = groups.filter(g => {
    const matchSearch = g.destination.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || g.travelType.toLowerCase() === filterType.toLowerCase();
    return matchSearch && matchType;
  });

  const travelTypes = ["adventure", "leisure", "trekking", "business"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Welcome Banner */}
          <div className="mb-8 rounded-3xl relative overflow-hidden h-72 sm:h-80">
            {/* Background Image */}
            <img
              src={welcomeBg}
              alt="Travel"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20"></div>

            {/* Text Content */}
            <div className="relative z-10 h-full flex items-end p-8 sm:p-12">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-white" />
                  <p className="text-white/90 font-medium text-sm">Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}!</p>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight drop-shadow-lg">
                  Find Your Next Travel Adventure
                </h1>
                <p className="text-white/90 mb-6 text-sm sm:text-base drop-shadow-md">
                  Discover amazing destinations, join travel groups, and create unforgettable memories.
                </p>
                <Link to="/create-group">
                  <Button size="lg" className="gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-md shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
                    <Plus className="h-5 w-5" />
                    Create New Group
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search destinations..."
                className="pl-12 h-12 rounded-2xl border-2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterType === null ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType(null)}
                className="rounded-full"
              >
                All
              </Button>
              {travelTypes.map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(type)}
                  className="rounded-full capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Groups Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-card rounded-2xl border shadow-card p-12 text-center">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-xl font-bold text-foreground mb-2">No groups found</h3>
              <p className="text-muted-foreground mb-6">
                {search || filterType ? "Try adjusting your filters" : "Be the first to create a travel group!"}
              </p>
              <Link to="/create-group">
                <Button variant="hero">Create Group</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((group) => (
                <Link
                  key={group.id}
                  to={`/group/${group.id}`}
                  className="group bg-card rounded-2xl border shadow-card overflow-hidden hover:shadow-elevated transition-all duration-300 hover:scale-[1.02]"
                >
                  {/* Group Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={group.image}
                      alt={group.destination}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                    {/* Travel Type Badge */}
                    <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground capitalize shadow-lg">
                      {group.travelType}
                    </Badge>

                    {/* Destination Overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-bold text-white mb-1">{group.destination}</h3>
                    </div>
                  </div>

                  {/* Group Info */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span className="truncate">{group.startDate} — {group.endDate}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4 shrink-0" />
                        <span>{group.memberCount}/{group.maxMembers} members</span>
                      </div>
                      {group.budget && (
                        <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                          <DollarSign className="h-4 w-4" />
                          <span>{group.budget}</span>
                        </div>
                      )}
                    </div>

                    {group.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {group.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
