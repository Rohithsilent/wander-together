import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Trash2, Bot, Sparkles, Plane, DollarSign, MapPin, Backpack } from "lucide-react";
import { useState } from "react";
import { sendMessageToGemini } from "@/services/gemini";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AIAssistant = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
      const aiResponse = await sendMessageToGemini(text, conversationHistory);
      const aiMsg: Message = {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast({ title: "Chat Cleared", description: "Your conversation history has been cleared." });
  };

  const suggestedPrompts = [
    { icon: Plane, text: "Help me plan a 7-day trip to Japan", category: "Trip Planning" },
    { icon: DollarSign, text: "What's a good budget for Thailand?", category: "Budgeting" },
    { icon: MapPin, text: "Suggest hidden gems in Europe", category: "Destinations" },
    { icon: Backpack, text: "Essential packing list for hiking", category: "Packing" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20 pb-6">
        <div className="container mx-auto px-4 h-full max-w-4xl flex flex-col">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Travel Buddy AI</h1>
                <p className="text-sm text-muted-foreground">Your personal travel planning companion</p>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 mb-4 overflow-hidden rounded-2xl border bg-card shadow-card">
            <div className="h-full overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="h-20 w-20 rounded-3xl gradient-primary flex items-center justify-center mb-6">
                    <Sparkles className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-3">How can I help you today?</h2>
                  <p className="text-muted-foreground mb-8 max-w-md">
                    Ask me anything about travel planning, destinations, budgets, itineraries, or packing tips!
                  </p>

                  {/* Suggested Prompts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                    {suggestedPrompts.map((prompt, idx) => {
                      const Icon = prompt.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => sendMessage(prompt.text)}
                          className="group bg-background hover:bg-accent border-2 border-border hover:border-primary rounded-xl p-4 text-left transition-all hover:shadow-md"
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground mb-1">{prompt.category}</p>
                              <p className="text-sm font-medium text-foreground line-clamp-2">{prompt.text}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                      <div className={`max-w-[85%] ${msg.role === "user" ? "order-2" : "order-1"}`}>
                        {msg.role === "assistant" && (
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-6 w-6 rounded-lg gradient-primary flex items-center justify-center">
                              <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">Wander AI</span>
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-3 ${msg.role === "user"
                            ? "gradient-primary text-primary-foreground rounded-tr-md"
                            : "bg-muted text-foreground rounded-tl-md shadow-sm"
                            }`}
                        >
                          {msg.role === "user" ? (
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                          ) : (
                            <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 dark:prose-invert">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          )}
                          <p
                            className={`text-[10px] mt-1.5 ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground/60"
                              }`}
                          >
                            {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="max-w-[85%]">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-6 w-6 rounded-lg gradient-primary flex items-center justify-center">
                            <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">Wander AI</span>
                        </div>
                        <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span className="text-sm text-muted-foreground">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-card border rounded-2xl shadow-card p-4">
            <div className="flex gap-3">
              <Textarea
                placeholder="Ask me anything about travel..."
                className="flex-1 min-h-[60px] max-h-32 resize-none rounded-xl border-2 focus:border-primary"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={loading}
              />
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  variant="hero"
                  size="icon"
                  className="h-12 w-12 rounded-xl"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
                {messages.length > 0 && (
                  <Button
                    onClick={clearChat}
                    disabled={loading}
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-xl"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Press <kbd className="px-1.5 py-0.5 rounded bg-muted border">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-muted border">Shift + Enter</kbd> for new line</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIAssistant;
