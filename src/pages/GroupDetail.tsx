import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, DollarSign, Users, Send, Plus, MessageCircle, Receipt } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";

const groupData = {
  destination: "Bali, Indonesia",
  dates: "Mar 15 - Mar 25, 2026",
  budget: "$1,500 - $2,500",
  type: "Leisure",
  description: "A relaxing trip to explore the beaches, temples, and rice terraces of Bali. We'll stay in Ubud and Seminyak.",
  members: [
    { name: "Sarah M.", role: "Admin" },
    { name: "James K.", role: "Member" },
    { name: "Priya D.", role: "Member" },
    { name: "Alex W.", role: "Member" },
  ],
  image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=400&fit=crop",
};

const mockMessages = [
  { sender: "Sarah M.", text: "Hey everyone! Excited for this trip! 🎉", time: "10:30 AM", isOwn: false },
  { sender: "You", text: "Can't wait! Should we book flights together?", time: "10:32 AM", isOwn: true },
  { sender: "James K.", text: "I found great deals on flights from LAX. Let me share the link.", time: "10:35 AM", isOwn: false },
  { sender: "Priya D.", text: "I'm flying from London, so I'll book separately. But let's sync on arrival time!", time: "10:40 AM", isOwn: false },
];

const mockExpenses = [
  { description: "Accommodation (Airbnb)", amount: 800, paidBy: "Sarah M." },
  { description: "Airport transfers", amount: 120, paidBy: "James K." },
  { description: "Group dinner", amount: 200, paidBy: "You" },
];

const GroupDetail = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, { sender: "You", text: newMessage, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), isOwn: true }]);
    setNewMessage("");
  };

  const totalExpenses = mockExpenses.reduce((s, e) => s + e.amount, 0);
  const perPerson = totalExpenses / groupData.members.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <div className="relative h-64 md:h-80">
          <img src={groupData.image} alt={groupData.destination} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">{groupData.type}</span>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mt-2">{groupData.destination}</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Calendar, label: "Dates", value: groupData.dates },
              { icon: DollarSign, label: "Budget", value: groupData.budget },
              { icon: Users, label: "Members", value: `${groupData.members.length} travelers` },
              { icon: MapPin, label: "Type", value: groupData.type },
            ].map(item => (
              <div key={item.label} className="bg-card rounded-xl border p-4 shadow-card">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <item.icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                <p className="text-sm font-semibold text-card-foreground">{item.value}</p>
              </div>
            ))}
          </div>

          <Tabs defaultValue="chat" className="space-y-6">
            <TabsList className="bg-muted">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> Chat</TabsTrigger>
              <TabsTrigger value="expenses" className="flex items-center gap-1"><Receipt className="h-3.5 w-3.5" /> Expenses</TabsTrigger>
            </TabsList>

            {/* Details */}
            <TabsContent value="details" className="space-y-6">
              <div className="bg-card rounded-2xl border shadow-card p-6">
                <h3 className="font-bold text-foreground mb-3">About this trip</h3>
                <p className="text-muted-foreground">{groupData.description}</p>
              </div>
              <div className="bg-card rounded-2xl border shadow-card p-6">
                <h3 className="font-bold text-foreground mb-4">Members</h3>
                <div className="space-y-3">
                  {groupData.members.map(m => (
                    <div key={m.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">{m.name[0]}</div>
                        <span className="font-medium text-foreground">{m.name}</span>
                      </div>
                      {m.role === "Admin" && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">Admin</span>}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Chat */}
            <TabsContent value="chat">
              <div className="bg-card rounded-2xl border shadow-card overflow-hidden">
                <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${msg.isOwn ? "gradient-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"}`}>
                        {!msg.isOwn && <p className="text-xs font-semibold mb-1 opacity-70">{msg.sender}</p>}
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${msg.isOwn ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{msg.time}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="border-t p-3 flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                    className="flex-1"
                  />
                  <Button variant="hero" size="icon" onClick={sendMessage}><Send className="h-4 w-4" /></Button>
                </div>
              </div>
            </TabsContent>

            {/* Expenses */}
            <TabsContent value="expenses" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card rounded-xl border shadow-card p-5 text-center">
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold text-foreground">${totalExpenses}</p>
                </div>
                <div className="bg-card rounded-xl border shadow-card p-5 text-center">
                  <p className="text-sm text-muted-foreground">Per Person</p>
                  <p className="text-2xl font-bold text-primary">${perPerson.toFixed(0)}</p>
                </div>
                <div className="bg-card rounded-xl border shadow-card p-5 text-center">
                  <p className="text-sm text-muted-foreground">Members</p>
                  <p className="text-2xl font-bold text-foreground">{groupData.members.length}</p>
                </div>
              </div>

              <div className="bg-card rounded-2xl border shadow-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground">Expenses</h3>
                  <Button variant="outline" size="sm"><Plus className="h-3 w-3 mr-1" /> Add Expense</Button>
                </div>
                <div className="space-y-3">
                  {mockExpenses.map((exp, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium text-foreground">{exp.description}</p>
                        <p className="text-sm text-muted-foreground">Paid by {exp.paidBy}</p>
                      </div>
                      <span className="font-bold text-foreground">${exp.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default GroupDetail;
