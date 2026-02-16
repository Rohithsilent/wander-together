import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Trash2, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { sendMessageToGemini } from "@/services/gemini";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI travel assistant. Ask me about destinations, packing tips, budget planning, or anything travel-related! ✈️",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.filter(m => m.content !== "Hello! I'm your AI travel assistant. Ask me about destinations, packing tips, budget planning, or anything travel-related! ✈️");
      const aiResponse = await sendMessageToGemini(input, history.map(m => ({ role: m.role, content: m.content })));
      const aiMsg: Message = {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      toast.error(error.message || "Failed to get AI response");
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again. 🙁", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: "Chat cleared! How can I help you with your travel plans? ✈️",
      timestamp: new Date(),
    }]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16 h-screen flex flex-col">
        <div className="container mx-auto px-4 flex-1 flex flex-col max-w-3xl py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">AI Travel Assistant</h1>
                <p className="text-xs text-muted-foreground">Powered by Gemini AI</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearChat}>
              <Trash2 className="h-4 w-4 mr-1" /> Clear
            </Button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 bg-card rounded-2xl border shadow-card overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-2.5 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-secondary" : "gradient-primary"}`}>
                      {msg.role === "user" ? <User className="h-4 w-4 text-secondary-foreground" /> : <Bot className="h-4 w-4 text-primary-foreground" />}
                    </div>
                    <div className={`rounded-2xl px-4 py-3 ${msg.role === "user" ? "gradient-primary text-primary-foreground rounded-tr-md" : "bg-muted text-foreground rounded-tl-md"}`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className={`text-[10px] mt-1.5 ${msg.role === "user" ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="border-t p-3 flex gap-2">
              <Input
                placeholder="Ask me about travel destinations, packing tips, budgets..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                className="flex-1"
                disabled={isLoading}
              />
              <Button variant="hero" size="icon" onClick={sendMessage} disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIAssistant;
