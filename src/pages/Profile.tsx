import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Loader2, MapPin, Users, Calendar, Mail, Globe, Pencil, DollarSign } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, updateUserProfile, getUserGroups, getGroupMembers } from "@/services/firestore";
import { Link } from "react-router-dom";
import { uploadImageToCloudinary, validateImageFile } from "@/services/cloudinaryService";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import coverBg from "@/assets/moto.jpg";

const Profile = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [joinedGroups, setJoinedGroups] = useState<any[]>([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    gender: "",
    bio: "",
    travelType: "",
    budget: "",
    languages: "",
  });

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [data, groups] = await Promise.all([
          getUserProfile(user.uid),
          getUserGroups(user.uid),
        ]);
        if (data) {
          setProfile({
            name: (data as any).name || user.displayName || "",
            age: (data as any).age || "",
            gender: (data as any).gender || "",
            bio: (data as any).bio || "",
            travelType: (data as any).travelType || "",
            budget: (data as any).budget || "",
            languages: (data as any).languages || "",
          });
          setPhotoURL((data as any).photoURL || user.photoURL || null);
        }

        const groupsWithMembers = await Promise.all(
          groups.map(async (g: any) => {
            try {
              const members = await getGroupMembers(g.id);
              return { ...g, memberCount: members.length };
            } catch {
              return { ...g, memberCount: 0 };
            }
          })
        );
        setJoinedGroups(groupsWithMembers);
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, profile);
      toast({ title: "Profile Updated", description: "Your profile has been saved successfully." });
      setShowEditForm(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const totalTrips = joinedGroups.length;
  const uniqueDestinations = new Set(joinedGroups.map((g: any) => g.destination)).size;

  if (loading) {
    return (
      <div className="min-h-screen app-background-themed">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="h-8 w-8 animate-spin text-themed-tertiary" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen app-background-themed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar />
      <main className="pt-20 pb-12">
        {/* Profile Header */}
        <motion.div
          className="w-full px-6 lg:px-10 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="rounded-3xl overflow-hidden glass-themed">
            {/* Cover Image */}
            <div className="relative h-44 overflow-hidden">
              <img src={coverBg} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/10"></div>
            </div>

            {/* Profile Content */}
            <div className="px-6 lg:px-10 pb-6">
              <div className="flex flex-col sm:flex-row items-start gap-5">
                {/* Profile Photo - overlapping the cover */}
                <div className="relative -mt-14 shrink-0">
                  <div className="relative">
                    {photoURL ? (
                      <img src={photoURL} alt="Profile" className="h-28 w-28 rounded-full object-cover border-4 border-themed shadow-2xl" />
                    ) : (
                      <div className="h-28 w-28 rounded-full border-4 border-themed shadow-2xl glass-themed-strong flex items-center justify-center text-3xl font-bold text-themed-primary">
                        {(profile.name || "?")[0]}
                      </div>
                    )}
                    <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !user) return;
                      const error = validateImageFile(file, 3);
                      if (error) { toast({ title: "Invalid File", description: error, variant: "destructive" }); return; }
                      setUploadingPhoto(true);
                      try {
                        const url = await uploadImageToCloudinary(file, "profile_pictures");
                        await updateUserProfile(user.uid, { photoURL: url });
                        setPhotoURL(url);
                        toast({ title: "Photo Updated" });
                      } catch (err: any) { toast({ title: "Upload Failed", description: err.message, variant: "destructive" }); }
                      finally { setUploadingPhoto(false); }
                    }} />
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full glass-themed-strong border-themed text-themed-primary flex items-center justify-center shadow-md hover:scale-110 hover:glass-themed transition-all disabled:opacity-50"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                    >
                      {uploadingPhoto ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* User Info + Stats Row */}
                <div className="flex-1 pt-3 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 w-full">
                    {/* Left: Name, Email, Bio */}
                    <div className="flex-1">
                      <h1 className="text-2xl font-light text-themed-primary">{profile.name || "Your Name"}</h1>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-themed-tertiary">
                        <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{user?.email}</span>
                        {profile.languages && <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" />{profile.languages}</span>}
                      </div>
                      {profile.bio && <p className="mt-2 text-sm text-themed-secondary font-light">{profile.bio}</p>}
                    </div>

                    {/* Right: Stats + Edit */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-center px-4 py-2 rounded-xl glass-themed border-themed">
                        <p className="text-xl font-bold text-themed-primary">{totalTrips}</p>
                        <p className="text-[11px] text-themed-tertiary">Trips</p>
                      </div>
                      <div className="text-center px-4 py-2 rounded-xl glass-themed border-themed">
                        <p className="text-xl font-bold text-themed-primary">{uniqueDestinations}</p>
                        <p className="text-[11px] text-themed-tertiary">Places</p>
                      </div>
                      <Button
                        size="sm"
                        className={`gap-1.5 border border-themed rounded-full transition-all ${showEditForm
                          ? 'glass-themed-strong text-themed-primary'
                          : 'glass-themed hover:glass-themed-strong text-themed-primary'
                          }`}
                        onClick={() => setShowEditForm(!showEditForm)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        {showEditForm ? "Cancel" : "Edit Profile"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Edit Profile Form (Collapsible) */}
        {showEditForm && (
          <motion.div
            className="w-full px-6 lg:px-10 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <form onSubmit={handleSave} className="glass-themed rounded-3xl p-6 lg:p-8">
              <h2 className="text-xl font-light text-themed-primary mb-6">Edit Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-themed-tertiary text-xs uppercase tracking-[0.2em] font-light">Full Name</Label>
                  <Input
                    value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    className="glass-themed-subtle text-themed-primary placeholder:text-themed-quaternary h-12 rounded-xl border-themed focus:glass-themed mb-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-themed-tertiary text-xs uppercase tracking-[0.2em] font-light">Age</Label>
                  <Input
                    type="number"
                    value={profile.age}
                    onChange={e => setProfile({ ...profile, age: e.target.value })}
                    className="glass-themed-subtle text-themed-primary placeholder:text-themed-quaternary h-12 rounded-xl border-themed focus:glass-themed mb-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-themed-tertiary text-xs uppercase tracking-[0.2em] font-light">Gender</Label>
                  <Select value={profile.gender} onValueChange={v => setProfile({ ...profile, gender: v })}>
                    <SelectTrigger className="glass-themed-subtle text-themed-primary h-12 rounded-xl border-themed">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/20">
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Non-binary">Non-binary</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 lg:col-span-3 space-y-2">
                  <Label className="text-themed-tertiary text-xs uppercase tracking-[0.2em] font-light">Bio</Label>
                  <Textarea
                    value={profile.bio}
                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                    rows={2}
                    placeholder="Tell us about yourself..."
                    className="glass-themed-subtle text-themed-primary placeholder:text-themed-quaternary rounded-xl border-themed focus:glass-themed transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-themed-tertiary text-xs uppercase tracking-[0.2em] font-light">Travel Type</Label>
                  <Select value={profile.travelType} onValueChange={v => setProfile({ ...profile, travelType: v })}>
                    <SelectTrigger className="glass-themed-subtle text-themed-primary h-12 rounded-xl border-themed">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/20">
                      <SelectItem value="adventure">Adventure</SelectItem>
                      <SelectItem value="leisure">Leisure</SelectItem>
                      <SelectItem value="trekking">Trekking</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-themed-tertiary text-xs uppercase tracking-[0.2em] font-light">Budget Range</Label>
                  <Input
                    value={profile.budget}
                    onChange={e => setProfile({ ...profile, budget: e.target.value })}
                    placeholder="e.g., $1000-$2000"
                    className="glass-themed-subtle text-themed-primary placeholder:text-themed-quaternary h-12 rounded-xl border-themed focus:glass-themed transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-themed-tertiary text-xs uppercase tracking-[0.2em] font-light">Languages</Label>
                  <Input
                    value={profile.languages}
                    onChange={e => setProfile({ ...profile, languages: e.target.value })}
                    placeholder="e.g., English, Hindi"
                    className="glass-themed-subtle text-themed-primary placeholder:text-themed-quaternary h-12 rounded-xl border-themed focus:glass-themed transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  type="submit"
                  disabled={saving}
                  className="border border-themed rounded-full glass-themed hover:glass-themed-strong text-themed-primary transition-all duration-300 hover:scale-105"
                >
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditForm(false)}
                  className="border border-themed rounded-full glass-themed hover:glass-themed-strong text-themed-primary transition-all duration-300"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Joined Groups */}
        <motion.div
          className="w-full px-6 lg:px-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Users className="h-6 w-6 text-themed-primary" />
            <h2 className="text-2xl font-light text-themed-primary">Joined Groups</h2>
          </div>

          {joinedGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {joinedGroups.map((group, index) => (
                <Link
                  key={group.id}
                  to={`/group/${group.id}`}
                  className="group block glass-themed rounded-3xl overflow-hidden hover:glass-themed-strong transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={group.coverImage || group.image || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=500&fit=crop"}
                      alt={group.destination}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <Badge className="absolute top-4 right-4 glass-themed-subtle border border-themed text-white capitalize shadow-lg backdrop-blur-sm">
                      {group.travelType}
                    </Badge>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-light text-white mb-1">{group.destination}</h3>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-themed-tertiary">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span className="truncate font-light">{group.startDate} — {group.endDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-themed-tertiary">
                        <Users className="h-4 w-4 shrink-0" />
                        <span className="font-light">{group.memberCount} members</span>
                      </div>
                      {group.budget && (
                        <div className="flex items-center gap-1 text-sm font-medium text-themed-primary">
                          <DollarSign className="h-4 w-4" />
                          <span>{group.budget}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="glass-themed rounded-3xl p-12 text-center">
              <MapPin className="h-12 w-12 mx-auto text-themed-quaternary mb-3" />
              <h3 className="text-xl font-light text-themed-primary mb-2">No trips yet</h3>
              <p className="text-themed-tertiary mb-6 font-light">Join a travel group to start your adventure!</p>
              <Link to="/dashboard">
                <Button className="border border-themed rounded-full glass-themed hover:glass-themed-strong text-themed-primary transition-all duration-300 hover:scale-105">
                  Explore Groups
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      </main>
    </motion.div>
  );
};

export default Profile;
