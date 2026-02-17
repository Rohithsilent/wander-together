import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Trash2, Bot, Sparkles, Plane, DollarSign, MapPin, Backpack } from "lucide-react";
import { useState } from "react";
import { sendMessageToGemini } from "@/services/gemini";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

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
    <motion.div
      className="min-h-screen app-background-themed flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar />

      <main className="flex-1 pt-20 pb-6">
        <div className="container mx-auto px-4 h-full max-w-4xl flex flex-col">
          {/* Header */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-2xl glass-themed-strong flex items-center justify-center">
                <Bot className="h-6 w-6 text-themed-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-light text-themed-primary">Travel Buddy AI</h1>
                <p className="text-sm text-themed-tertiary">Your personal travel planning companion</p>
              </div>
            </div>
          </motion.div>

          {/* Messages Container */}
          <motion.div
            className="flex-1 mb-4 overflow-hidden rounded-3xl glass-themed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="h-full overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="h-20 w-20 rounded-3xl glass-themed-strong flex items-center justify-center mb-6">
                    <Sparkles className="h-10 w-10 text-themed-primary" />
                  </div>
                  <h2 className="text-2xl font-light text-themed-primary mb-3">How can I help you today?</h2>
                  <p className="text-themed-tertiary mb-8 max-w-md font-light">
                    Ask me anything about travel planning, destinations, budgets, itineraries, or packing tips!
                  </p>

                  {/* Suggested Prompts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                    {suggestedPrompts.map((prompt, idx) => {
                      const Icon = prompt.icon;
                      return (
                        <motion.button
                          key={idx}
                          onClick={() => sendMessage(prompt.text)}
                          className="group glass-themed-subtle hover:glass-themed rounded-2xl p-4 text-left transition-all hover:scale-105"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.5 + idx * 0.1 }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg glass-themed-strong flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                              <Icon className="h-5 w-5 text-themed-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-themed-quaternary mb-1 uppercase tracking-wide">{prompt.category}</p>
                              <p className="text-sm font-medium text-themed-primary line-clamp-2">{prompt.text}</p>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <>
                  <AnimatePresence>
                    {messages.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className={`max-w-[85%] ${msg.role === "user" ? "order-2" : "order-1"}`}>
                          {msg.role === "assistant" && (
                            <div className="flex items-center gap-2 mb-2">
                              <div className="h-6 w-6 rounded-lg glass-themed-strong flex items-center justify-center">
                                <Bot className="h-3.5 w-3.5 text-themed-primary" />
                              </div>
                              <span className="text-xs font-medium text-themed-tertiary">Wander AI</span>
                            </div>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-3 ${msg.role === "user"
                                ? "glass-themed-strong text-themed-primary rounded-tr-md"
                                : "glass-themed text-themed-primary rounded-tl-md"
                              }`}
                          >
                            {msg.role === "user" ? (
                              <p className="text-sm leading-relaxed">{msg.content}</p>
                            ) : (
                              <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 dark:prose-invert light:prose-slate">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                              </div>
                            )}
                            <p className="text-[10px] mt-1.5 text-themed-quaternary">
                              {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {loading && (
                    <motion.div
                      className="flex justify-start"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="max-w-[85%]">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-6 w-6 rounded-lg glass-themed-strong flex items-center justify-center">
                            <Bot className="h-3.5 w-3.5 text-themed-primary" />
                          </div>
                          <span className="text-xs font-medium text-themed-tertiary">Wander AI</span>
                        </div>
                        <div className="glass-themed rounded-2xl rounded-tl-md px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-themed-primary" />
                            <span className="text-sm text-themed-tertiary">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </motion.div>

          {/* Input Area */}
          <motion.div
            className="glass-themed rounded-3xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex gap-3">
              <Textarea
                placeholder="Ask me anything about travel..."
                className="flex-1 min-h-[60px] max-h-32 resize-none rounded-xl glass-themed-subtle text-themed-primary placeholder:text-themed-quaternary focus:glass-themed-strong border-0"
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
                  size="icon"
                  className="h-12 w-12 rounded-xl glass-themed-strong hover:glass-themed text-themed-primary border-0"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
                {messages.length > 0 && (
                  <Button
                    onClick={clearChat}
                    disabled={loading}
                    size="icon"
                    className="h-12 w-12 rounded-xl glass-themed hover:glass-themed-strong text-themed-primary border-themed"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-themed-quaternary mt-2">
              Press <kbd className="px-1.5 py-0.5 rounded glass-themed-subtle border border-themed">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded glass-themed-subtle border border-themed">Shift + Enter</kbd> for new line
            </p>
          </motion.div>
        </div>
      </main>
    </motion.div>
  );
};

export default AIAssistant;
