import Navbar from "@/components/Navbar";
import FloatingAI from "@/components/ai/FloatingAI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Search, Plus, MapPin, Calendar, DollarSign, Users, Loader2, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { getGroups, getGroupMembers } from "@/services/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
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
    <motion.div
      className="min-h-screen app-background-themed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Welcome Banner */}
          <motion.div
            className="mb-8 rounded-3xl relative overflow-hidden h-72 sm:h-80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
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
                  <p className="text-white/80 font-light text-sm tracking-wide">
                    Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}!
                  </p>
                </div>
                <h1 className="text-white font-extralight leading-tight tracking-tighter mb-3" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
                  Find Your Next
                  <br />
                  <span className="font-light">Adventure</span>
                </h1>
                <p className="text-white/80 mb-6 text-sm sm:text-base font-light">
                  Discover amazing destinations, join travel groups, and create unforgettable memories.
                </p>
                <Link to="/create-group">
                  <Button className="gap-2 border border-white/20 rounded-full backdrop-blur-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-500 hover:scale-105 px-6 py-3">
                    <Plus className="h-5 w-5" />
                    Create New Group
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            className="mb-8 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-themed-quaternary" />
              <Input
                placeholder="Search destinations..."
                className="pl-12 h-12 rounded-2xl glass-themed-subtle text-themed-primary placeholder:text-themed-quaternary backdrop-blur-sm focus:glass-themed border-0 transition-all"
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
                className={`rounded-full ${filterType === null
                  ? 'glass-themed-strong border-themed-strong text-themed-primary hover:scale-105'
                  : 'glass-themed border-themed text-themed-tertiary hover:glass-themed-strong hover:text-themed-primary'
                  }`}
              >
                All
              </Button>
              {travelTypes.map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(type)}
                  className={`rounded-full capitalize ${filterType === type
                    ? 'glass-themed-strong border-themed-strong text-themed-primary hover:scale-105'
                    : 'glass-themed border-themed text-themed-tertiary hover:glass-themed-strong hover:text-themed-primary'
                    }`}
                >
                  {type}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Groups Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-themed-tertiary" />
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              className="glass-themed rounded-3xl p-12 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <MapPin className="h-12 w-12 mx-auto text-themed-quaternary mb-3" />
              <h3 className="text-xl font-light text-themed-primary mb-2">No groups found</h3>
              <p className="text-themed-tertiary mb-6 font-light">
                {search || filterType ? "Try adjusting your filters" : "Be the first to create a travel group!"}
              </p>
              <Link to="/create-group">
                <Button className="border border-themed rounded-full glass-themed hover:glass-themed-strong text-themed-primary transition-all duration-300 hover:scale-105">
                  Create Group
                </Button>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {filtered.map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                >
                  <Link
                    to={`/group/${group.id}`}
                    className="group block glass-themed rounded-3xl overflow-hidden hover:glass-themed-strong transition-all duration-300 hover:scale-[1.02]"
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
                      <Badge className="absolute top-4 right-4 glass-themed-subtle border border-themed text-white capitalize shadow-lg backdrop-blur-sm">
                        {group.travelType}
                      </Badge>

                      {/* Destination Overlay */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-2xl font-light text-white mb-1">{group.destination}</h3>
                      </div>
                    </div>

                    {/* Group Info */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-themed-tertiary">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span className="truncate font-light">{group.startDate} — {group.endDate}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-themed-tertiary">
                          <Users className="h-4 w-4 shrink-0" />
                          <span className="font-light">{group.memberCount}/{group.maxMembers} members</span>
                        </div>
                        {group.budget && (
                          <div className="flex items-center gap-1 text-sm font-medium text-themed-primary">
                            <DollarSign className="h-4 w-4" />
                            <span>{group.budget}</span>
                          </div>
                        )}
                      </div>

                      {group.description && (
                        <p className="text-sm text-themed-quaternary line-clamp-2 font-light">
                          {group.description}
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
      <FloatingAI />
    </motion.div>
  );
};

export default Dashboard;
