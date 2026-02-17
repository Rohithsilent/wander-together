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

        // Fetch member counts for each group
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12">
        {/* Full-Width Profile Header */}
        <div className="w-full px-6 lg:px-10 mb-8">
          <div className="rounded-3xl overflow-hidden border shadow-card bg-card">
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
                      <img src={photoURL} alt="Profile" className="h-28 w-28 rounded-full object-cover border-4 border-card shadow-elevated" />
                    ) : (
                      <div className="h-28 w-28 rounded-full border-4 border-card shadow-elevated bg-muted flex items-center justify-center text-3xl font-bold text-primary">
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
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform disabled:opacity-50 border-2 border-card"
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
                      <h1 className="text-2xl font-bold text-foreground">{profile.name || "Your Name"}</h1>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{user?.email}</span>
                        {profile.languages && <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" />{profile.languages}</span>}
                      </div>
                      {profile.bio && <p className="mt-2 text-sm text-foreground/70">{profile.bio}</p>}
                    </div>

                    {/* Right: Stats + Edit */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-center px-4 py-2 border rounded-xl bg-background">
                        <p className="text-xl font-bold text-foreground">{totalTrips}</p>
                        <p className="text-[11px] text-muted-foreground">Trips</p>
                      </div>
                      <div className="text-center px-4 py-2 border rounded-xl bg-background">
                        <p className="text-xl font-bold text-foreground">{uniqueDestinations}</p>
                        <p className="text-[11px] text-muted-foreground">Places</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
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
        </div>

        {/* Edit Profile Form (Collapsible) */}
        {showEditForm && (
          <div className="w-full px-6 lg:px-10 mb-8">
            <form onSubmit={handleSave} className="bg-card rounded-2xl border shadow-card p-6 lg:p-8">
              <h2 className="text-xl font-bold text-foreground mb-6">Edit Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input type="number" value={profile.age} onChange={e => setProfile({ ...profile, age: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={profile.gender} onValueChange={v => setProfile({ ...profile, gender: v })}>
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Non-binary">Non-binary</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 lg:col-span-3 space-y-2">
                  <Label>Bio</Label>
                  <Textarea value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} rows={2} placeholder="Tell us about yourself..." />
                </div>
                <div className="space-y-2">
                  <Label>Travel Type</Label>
                  <Select value={profile.travelType} onValueChange={v => setProfile({ ...profile, travelType: v })}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adventure">Adventure</SelectItem>
                      <SelectItem value="leisure">Leisure</SelectItem>
                      <SelectItem value="trekking">Trekking</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Budget Range</Label>
                  <Input value={profile.budget} onChange={e => setProfile({ ...profile, budget: e.target.value })} placeholder="e.g., $1000-$2000" />
                </div>
                <div className="space-y-2">
                  <Label>Languages</Label>
                  <Input value={profile.languages} onChange={e => setProfile({ ...profile, languages: e.target.value })} placeholder="e.g., English, Hindi" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button type="submit" variant="hero" disabled={saving}>{saving ? "Saving..." : "Save Profile"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowEditForm(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        {/* Joined Groups - Full Width */}
        <div className="w-full px-6 lg:px-10">
          <h2 className="text-2xl font-bold text-foreground mb-6">My Travel Groups</h2>
          {joinedGroups.length === 0 ? (
            <div className="bg-card rounded-2xl border shadow-card p-12 text-center">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">You haven't joined any groups yet</p>
              <Link to="/dashboard"><Button variant="hero">Explore Groups</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {joinedGroups.map((g: any) => {
                const fallbackImage = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=500&fit=crop";
                const groupImage = g.coverImage || g.image || fallbackImage;

                return (
                  <Link
                    key={g.id}
                    to={`/group/${g.id}`}
                    className="group bg-card rounded-2xl border shadow-card overflow-hidden hover:shadow-elevated transition-all duration-300 hover:scale-[1.02]"
                  >
                    {/* Image */}
                    <div className="relative h-44 overflow-hidden">
                      <img src={groupImage} alt={g.destination} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground capitalize text-xs">{g.travelType || "leisure"}</Badge>
                      <h3 className="absolute bottom-3 left-3 text-lg font-bold text-white drop-shadow-lg">{g.destination}</h3>
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>{g.startDate} — {g.endDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          <span>{g.memberCount}/{g.maxMembers || 6} members</span>
                        </div>
                        {g.budget && (
                          <span className="text-xs font-bold text-primary flex items-center gap-0.5">
                            <DollarSign className="h-3.5 w-3.5" />{g.budget}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
