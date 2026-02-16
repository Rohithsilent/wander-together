import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const CreateGroup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPrivate, setIsPrivate] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Group Created!", description: "Your travel group has been created successfully." });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create a Travel Group</h1>
          <p className="text-muted-foreground mb-8">Set up your trip and invite fellow travelers.</p>

          <form onSubmit={handleCreate} className="bg-card rounded-2xl border shadow-card p-8 space-y-6">
            <div className="space-y-2">
              <Label>Destination</Label>
              <Input placeholder="e.g., Bali, Indonesia" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" required />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Budget Range</Label>
                <Input placeholder="e.g., $1,500 - $2,500" required />
              </div>
              <div className="space-y-2">
                <Label>Max Members</Label>
                <Input type="number" min={2} max={20} placeholder="6" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Travel Type</Label>
              <Select>
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
              <Label>Description</Label>
              <Textarea placeholder="Tell potential members about your trip plans..." rows={4} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
              <Label>Private Group (requires admin approval to join)</Label>
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full">Create Group</Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateGroup;
