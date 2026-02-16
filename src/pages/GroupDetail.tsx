import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, DollarSign, Users, Send, Plus, MessageCircle, Receipt, Loader2, UserMinus, Check, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  getGroup,
  getGroupMembers,
  joinGroup,
  leaveGroup,
  removeMember,
  sendChatMessage,
  subscribeToChatMessages,
  addExpense,
  subscribeToExpenses,
  sendJoinRequest,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
} from "@/services/firestore";

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [expenseForm, setExpenseForm] = useState({ description: "", amount: "" });
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = members.some((m) => m.userId === user?.uid && m.role === "admin");
  const isMember = members.some((m) => m.userId === user?.uid);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const [groupData, membersData] = await Promise.all([
          getGroup(id),
          getGroupMembers(id),
        ]);
        setGroup(groupData);
        setMembers(membersData);
        if (isAdmin) {
          const requests = await getJoinRequests(id);
          setJoinRequests(requests);
        }
      } catch (error) {
        console.error("Error loading group:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Real-time chat
  useEffect(() => {
    if (!id) return;
    const unsub = subscribeToChatMessages(id, (msgs) => setMessages(msgs));
    return () => unsub();
  }, [id]);

  // Real-time expenses
  useEffect(() => {
    if (!id) return;
    const unsub = subscribeToExpenses(id, (exps) => setExpenses(exps));
    return () => unsub();
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !id) return;
    try {
      await sendChatMessage(id, user.uid, user.displayName || "Anonymous", user.photoURL || "", newMessage);
      setNewMessage("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleJoin = async () => {
    if (!user || !id) return;
    try {
      if (group?.isPrivate) {
        await sendJoinRequest(id, user.uid, user.displayName || "Anonymous");
        toast({ title: "Request Sent", description: "Your join request has been sent to the admin." });
      } else {
        await joinGroup(id, user.uid, user.displayName || "Anonymous");
        const updatedMembers = await getGroupMembers(id);
        setMembers(updatedMembers);
        toast({ title: "Joined!", description: "You have joined the group." });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleLeave = async () => {
    if (!user || !id) return;
    try {
      await leaveGroup(id, user.uid);
      const updatedMembers = await getGroupMembers(id);
      setMembers(updatedMembers);
      toast({ title: "Left Group", description: "You have left the group." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!id) return;
    try {
      await removeMember(id, userId);
      const updatedMembers = await getGroupMembers(id);
      setMembers(updatedMembers);
      toast({ title: "Member Removed" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleApproveRequest = async (req: any) => {
    if (!id) return;
    try {
      await approveJoinRequest(req.id, id, req.userId, req.userName);
      setJoinRequests((prev) => prev.filter((r) => r.id !== req.id));
      const updatedMembers = await getGroupMembers(id);
      setMembers(updatedMembers);
      toast({ title: "Request Approved" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectJoinRequest(requestId);
      setJoinRequests((prev) => prev.filter((r) => r.id !== requestId));
      toast({ title: "Request Rejected" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    try {
      await addExpense(id, expenseForm.description, parseFloat(expenseForm.amount), user.uid, user.displayName || "Anonymous");
      setExpenseForm({ description: "", amount: "" });
      setShowExpenseForm(false);
      toast({ title: "Expense Added" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <p className="text-muted-foreground">Group not found.</p>
        </div>
      </div>
    );
  }

  const totalExpenses = expenses.reduce((s: number, e: any) => s + (e.amount || 0), 0);
  const perPerson = members.length > 0 ? totalExpenses / members.length : 0;

  const fallbackImage = "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=400&fit=crop";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <div className="relative h-64 md:h-80">
          <img src={group.image || fallbackImage} alt={group.destination} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">{group.travelType}</span>
              <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mt-2">{group.destination}</h1>
            </div>
            {!isMember ? (
              <Button variant="accent" onClick={handleJoin}>{group.isPrivate ? "Request to Join" : "Join Group"}</Button>
            ) : !isAdmin ? (
              <Button variant="outline" className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10" onClick={handleLeave}>Leave Group</Button>
            ) : null}
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Calendar, label: "Dates", value: `${group.startDate} — ${group.endDate}` },
              { icon: DollarSign, label: "Budget", value: group.budget },
              { icon: Users, label: "Members", value: `${members.length}/${group.maxMembers}` },
              { icon: MapPin, label: "Type", value: group.travelType },
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
                <p className="text-muted-foreground">{group.description || "No description provided."}</p>
              </div>

              {/* Join Requests (Admin only) */}
              {isAdmin && joinRequests.length > 0 && (
                <div className="bg-card rounded-2xl border shadow-card p-6">
                  <h3 className="font-bold text-foreground mb-4">Join Requests</h3>
                  <div className="space-y-3">
                    {joinRequests.map((req: any) => (
                      <div key={req.id} className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{req.userName}</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="default" onClick={() => handleApproveRequest(req)}><Check className="h-3 w-3 mr-1" /> Approve</Button>
                          <Button size="sm" variant="outline" onClick={() => handleRejectRequest(req.id)}><X className="h-3 w-3 mr-1" /> Reject</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-card rounded-2xl border shadow-card p-6">
                <h3 className="font-bold text-foreground mb-4">Members</h3>
                <div className="space-y-3">
                  {members.map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">{(m.userName || "?")[0]}</div>
                        <span className="font-medium text-foreground">{m.userName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {m.role === "admin" && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">Admin</span>}
                        {isAdmin && m.role !== "admin" && (
                          <Button size="sm" variant="ghost" onClick={() => handleRemoveMember(m.userId)}><UserMinus className="h-3.5 w-3.5" /></Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Chat */}
            <TabsContent value="chat">
              <div className="bg-card rounded-2xl border shadow-card overflow-hidden">
                <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <p className="text-center text-muted-foreground py-10">No messages yet. Start the conversation!</p>
                  )}
                  {messages.map((msg: any, i: number) => {
                    const isOwn = msg.userId === user?.uid;
                    return (
                      <div key={msg.id || i} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isOwn ? "gradient-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"}`}>
                          {!isOwn && <p className="text-xs font-semibold mb-1 opacity-70">{msg.userName}</p>}
                          <p className="text-sm">{msg.text}</p>
                          <p className={`text-[10px] mt-1 ${isOwn ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                            {msg.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) || ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
                {isMember && (
                  <div className="border-t p-3 flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button variant="hero" size="icon" onClick={handleSendMessage}><Send className="h-4 w-4" /></Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Expenses */}
            <TabsContent value="expenses" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card rounded-xl border shadow-card p-5 text-center">
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold text-foreground">${totalExpenses.toFixed(2)}</p>
                </div>
                <div className="bg-card rounded-xl border shadow-card p-5 text-center">
                  <p className="text-sm text-muted-foreground">Per Person</p>
                  <p className="text-2xl font-bold text-primary">${perPerson.toFixed(2)}</p>
                </div>
                <div className="bg-card rounded-xl border shadow-card p-5 text-center">
                  <p className="text-sm text-muted-foreground">Members</p>
                  <p className="text-2xl font-bold text-foreground">{members.length}</p>
                </div>
              </div>

              <div className="bg-card rounded-2xl border shadow-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground">Expenses</h3>
                  {isMember && (
                    <Button variant="outline" size="sm" onClick={() => setShowExpenseForm(!showExpenseForm)}>
                      <Plus className="h-3 w-3 mr-1" /> Add Expense
                    </Button>
                  )}
                </div>

                {showExpenseForm && (
                  <form onSubmit={handleAddExpense} className="flex gap-2 mb-4">
                    <Input placeholder="Description" value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} required className="flex-1" />
                    <Input type="number" placeholder="Amount" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} required className="w-28" step="0.01" />
                    <Button type="submit" variant="default" size="sm">Add</Button>
                  </form>
                )}

                <div className="space-y-3">
                  {expenses.length === 0 && <p className="text-muted-foreground text-sm">No expenses recorded yet.</p>}
                  {expenses.map((exp: any) => (
                    <div key={exp.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium text-foreground">{exp.description}</p>
                        <p className="text-sm text-muted-foreground">Paid by {exp.paidByName}</p>
                      </div>
                      <span className="font-bold text-foreground">${(exp.amount || 0).toFixed(2)}</span>
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
