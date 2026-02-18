import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { createGroup } from "@/services/firestore";
import { fetchDestinationImage } from "@/services/imageService";
import { useState, useRef } from "react";
import type { Place } from "@/types/itinerary";
import MultiLocationPicker from "@/components/map/MultiLocationPicker";
import { motion } from "framer-motion";
import { uploadImageToCloudinary, validateImageFile } from "@/services/cloudinaryService";
import { Image as ImageIcon, Loader2, X } from "lucide-react";

const CreateGroup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null); // Verify import of useRef
  const [form, setForm] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    maxMembers: "6",
    travelType: "leisure",
    description: "",
    isPrivate: false,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (places.length === 0) {
      toast({ title: "Missing Itinerary", description: "Please add at least one place to the itinerary.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const imageQuery = places.length > 0 ? places[0].name : form.destination;
      console.log('🔍 Image query:', imageQuery);
      console.log('📍 Places:', places);
      console.log('🌍 Destination:', form.destination);

      console.log('🌍 Destination:', form.destination);

      let finalCoverImage = coverImage;
      if (!finalCoverImage) {
        finalCoverImage = await fetchDestinationImage(imageQuery);
      }
      console.log('🎨 Final cover image:', finalCoverImage);

      const groupId = await createGroup({
        destination: form.destination,
        places,
        coverImage: finalCoverImage,
        startDate: form.startDate,
        endDate: form.endDate,
        budget: form.budget,
        travelType: form.travelType,
        maxMembers: parseInt(form.maxMembers),
        description: form.description,
        isPrivate: form.isPrivate,
        createdBy: user.uid,
        createdByName: user.displayName || "Anonymous",
      });
      console.log('✅ Group created with ID:', groupId);
      toast({ title: "Group Created!", description: "Your travel group has been created successfully." });
      navigate(`/group/${groupId}`);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen app-background-themed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar />
      <main className="pt-20 pb-12">
        <motion.div
          className="container mx-auto px-4 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-themed-primary font-extralight leading-tight tracking-tighter mb-2" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
            Create a
            <br />
            <span className="font-light">Travel Group</span>
          </h1>
          <p className="text-themed-secondary mb-8 font-light">Set up your trip and invite fellow travelers.</p>

          <form onSubmit={handleCreate} className="glass-themed rounded-3xl p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-themed-tertiary text-xs uppercase tracking-[0.2em] font-light">Destination</Label>
              <Input
                placeholder="e.g., Bali, Indonesia"
                value={form.destination}
                onChange={e => setForm({ ...form, destination: e.target.value })}
                required
                className="glass-themed-subtle text-themed-primary placeholder:text-themed-quaternary h-12 rounded-xl border-themed focus:glass-themed transition-all"
              />
            </div>

            <MultiLocationPicker places={places} onChange={setPlaces} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-themed-tertiary text-xs uppercase tracking-[0.2em] font-light">Start Date</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                  required
                  className="glass-themed-subtle text-themed-primary placeholder:text-themed-quaternary h-12 rounded-xl border-themed focus:glass-themed transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-themed-tertiary text-xs uppercase tracking-[0.2em] font-light">End Date</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm({ ...form, endDate: e.target.value })}
                  required
                  className="glass-themed-subtle text-themed-primary placeholder:text-themed-quaternary h-12 rounded-xl border-themed focus:glass-themed transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-themed-tertiary text-xs uppercase tracking-[0.2em] font-light">Cover Image</Label>
              <div className="glass-themed-subtle rounded-xl p-4 border-themed">
                {!coverImage ? (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-themed-secondary font-light">
                      <span className="block mb-1">Auto-generated from Unsplash</span>
                      <span className="text-xs text-themed-tertiary">Based on your destination settings.</span>
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const error = validateImageFile(file, 5);
                          if (error) {
                            toast({ title: "Invalid File", description: error, variant: "destructive" });
                            return;
                          }
                          setUploadingCover(true);
                          try {
                            const url = await uploadImageToCloudinary(file, "group_covers");
                            setCoverImage(url);
                            toast({ title: "Cover Uploaded", description: "Custom cover image set." });
                          } catch (err: any) {
                            toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
                          } finally {
                            setUploadingCover(false);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingCover}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-themed text-themed-primary hover:glass-themed-strong"
                      >
                        {uploadingCover ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ImageIcon className="h-4 w-4 mr-2" />}
                        Upload Custom
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-48 rounded-lg overflow-hidden group">
                    <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setCoverImage(null)}
                        className="rounded-full"
                      >
                        <X className="h-4 w-4 mr-2" /> Remove Custom Image
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-themed-tertiary text-xs uppercase tracking-[0.2em] font-light">Budget Range</Label>
                <Input
                  placeholder="e.g., $1,500 - $2,500"
                  value={form.budget}
                  onChange={e => setForm({ ...form, budget: e.target.value })}
                  required
                  className="glass-themed-subtle text-themed-primary placeholder:text-themed-quaternary h-12 rounded-xl border-themed focus:glass-themed transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-themed-tertiary text-xs uppercase tracking-[0.2em] font-light">Max Members</Label>
                <Input
                  type="number"
                  min={2}
                  max={20}
                  value={form.maxMembers}
                  onChange={e => setForm({ ...form, maxMembers: e.target.value })}
                  required
                  className="glass-themed-subtle text-themed-primary placeholder:text-themed-quaternary h-12 rounded-xl border-themed focus:glass-themed transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-themed-tertiary text-xs uppercase tracking-[0.2em] font-light">Travel Type</Label>
              <Select value={form.travelType} onValueChange={v => setForm({ ...form, travelType: v })}>
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
              <Label className="text-themed-tertiary text-xs uppercase tracking-[0.2em] font-light">Description</Label>
              <Textarea
                placeholder="Tell potential members about your trip plans..."
                rows={4}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="glass-themed-subtle text-themed-primary placeholder:text-themed-quaternary rounded-xl border-themed focus:glass-themed transition-all"
              />
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl glass-themed border-themed">
              <Switch
                checked={form.isPrivate}
                onCheckedChange={v => setForm({ ...form, isPrivate: v })}
                className="data-[state=checked]:bg-white/30"
              />
              <Label className="text-themed-secondary text-sm font-light">Private Group (requires admin approval to join)</Label>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full border border-themed rounded-full glass-themed hover:glass-themed-strong text-themed-primary transition-all duration-500 hover:scale-105 hover:border-themed h-12"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Group"}
            </Button>
          </form>
        </motion.div>
      </main>
    </motion.div>
  );
};

export default CreateGroup;
