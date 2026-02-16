import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Loader2, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, updateUserProfile, getUserGroups } from "@/services/firestore";
import { Link } from "react-router-dom";

const Profile = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [joinedGroups, setJoinedGroups] = useState<any[]>([]);
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
        }
        setJoinedGroups(groups);
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
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

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
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="text-3xl font-bold text-foreground mb-8">Your Profile</h1>

          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="h-24 w-24 rounded-2xl object-cover" />
              ) : (
                <div className="h-24 w-24 rounded-2xl gradient-primary flex items-center justify-center text-3xl font-bold text-primary-foreground">
                  {(profile.name || "?")[0]}
                </div>
              )}
              <button className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{profile.name || "Your Name"}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="bg-card rounded-2xl border shadow-card p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" value={profile.age} onChange={e => setProfile({ ...profile, age: e.target.value })} />
              </div>
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
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Preferred Travel Type</Label>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Budget Range</Label>
                <Input value={profile.budget} onChange={e => setProfile({ ...profile, budget: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Languages Spoken</Label>
                <Input value={profile.languages} onChange={e => setProfile({ ...profile, languages: e.target.value })} />
              </div>
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={saving}>
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </form>

          <div className="mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Joined Groups</h2>
            {joinedGroups.length === 0 ? (
              <p className="text-muted-foreground">You haven't joined any groups yet.</p>
            ) : (
              <div className="space-y-3">
                {joinedGroups.map((g: any) => (
                  <Link key={g.id} to={`/group/${g.id}`} className="block bg-card rounded-xl border shadow-card p-4 hover:shadow-elevated transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{g.destination}</p>
                        <p className="text-xs text-muted-foreground">{g.startDate} — {g.endDate}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
