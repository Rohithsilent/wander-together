import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Search, Plus, MapPin, Calendar, DollarSign, Users, Filter, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getGroups, getGroupMembers } from "@/services/firestore";

const fallbackImages = [
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400&h=250&fit=crop",
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Explore Groups</h1>
              <p className="text-muted-foreground">Find your next travel adventure</p>
            </div>
            <Link to="/create-group">
              <Button variant="hero" size="lg">
                <Plus className="h-4 w-4 mr-2" /> Create Group
              </Button>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search destinations..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["Adventure", "Leisure", "Trekking", "Business"].map(type => (
                <Button
                  key={type}
                  variant={filterType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(filterType === type ? null : type)}
                >
                  <Filter className="h-3 w-3 mr-1" /> {type}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(group => (
                <Link key={group.id} to={`/group/${group.id}`} className="group">
                  <div className="bg-card rounded-2xl border shadow-card overflow-hidden hover:shadow-elevated transition-all duration-300 group-hover:-translate-y-1">
                    <div className="relative h-48 overflow-hidden">
                      <img src={group.image} alt={group.destination} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <span className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">{group.travelType}</span>
                    </div>
                    <div className="p-5 space-y-3">
                      <h3 className="text-lg font-bold text-card-foreground">{group.destination}</h3>
                      <div className="space-y-1.5 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> {group.startDate} - {group.endDate}</div>
                        <div className="flex items-center gap-2"><DollarSign className="h-3.5 w-3.5" /> {group.budget}</div>
                        <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5" /> {group.memberCount}/{group.maxMembers} members</div>
                      </div>
                      <Button variant="default" size="sm" className="w-full mt-2">View Group</Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-20">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground">No groups found</h3>
              <p className="text-muted-foreground">Try a different search or create your own group!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
