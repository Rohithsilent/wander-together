import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Trash2, Bot, Sparkles, Plane, DollarSign, MapPin, Backpack, Copy } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { sendMessageToGemini } from "@/services/gemini";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface ChatInterfaceProps {
    className?: string;
    compact?: boolean; // For the floating modal version
}

const ChatInterface = ({ className = "", compact = false }: ChatInterfaceProps) => {
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    useEffect(() => {
        const observer = new MutationObserver(() => {
            scrollToBottom();
        });

        if (messagesEndRef.current?.parentElement) {
            observer.observe(messagesEndRef.current.parentElement, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }

        return () => observer.disconnect();
    }, []);

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
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
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
        <div className={`flex flex-col h-full relative ${className}`}>
            {/* Messages Container */}
            <motion.div
                className={`flex-1 overflow-hidden w-full ${compact ? 'mb-2' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
            >
                <div className="h-full overflow-y-auto px-4 sm:px-6 pt-6 pb-40 space-y-6 dark-scrollbar">
                    {!compact && (
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-12 w-12 rounded-2xl glass-themed-strong flex items-center justify-center">
                                    <Bot className="h-6 w-6 text-themed-primary" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-light text-themed-primary">Travel Buddy AI</h1>
                                    <p className="text-sm text-themed-tertiary">Your personal travel planning companion</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center px-4">
                            <div className={`rounded-3xl glass-themed-strong flex items-center justify-center mb-6 ${compact ? 'h-16 w-16' : 'h-20 w-20'}`}>
                                <Sparkles className={`${compact ? 'h-8 w-8' : 'h-10 w-10'} text-themed-primary`} />
                            </div>
                            <h2 className={`${compact ? 'text-xl' : 'text-2xl'} font-light text-themed-primary mb-3`}>How can I help you?</h2>
                            {!compact && (
                                <p className="text-themed-tertiary mb-8 max-w-md font-light">
                                    Ask me anything about travel planning, destinations, budgets, itineraries, or packing tips!
                                </p>
                            )}

                            {/* Suggested Prompts */}
                            <div className={`grid grid-cols-1 ${compact ? '' : 'md:grid-cols-2'} gap-4 w-full max-w-2xl`}>
                                {suggestedPrompts.slice(0, compact ? 2 : 4).map((prompt, idx) => {
                                    const Icon = prompt.icon;
                                    return (
                                        <motion.button
                                            key={idx}
                                            onClick={() => sendMessage(prompt.text)}
                                            className="group glass-themed-subtle hover:glass-themed rounded-2xl p-3 sm:p-4 text-left transition-all hover:scale-105"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: 0.5 + idx * 0.1 }}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg glass-themed-strong flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-themed-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] sm:text-xs text-themed-quaternary mb-1 uppercase tracking-wide">{prompt.category}</p>
                                                    <p className="text-xs sm:text-sm font-medium text-themed-primary line-clamp-2">{prompt.text}</p>
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
                                        <div className={`max-w-[85%] ${msg.role === "user" ? "order-2" : "order-1 min-w-[300px]"}`}>
                                            {msg.role === "assistant" && (
                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded-lg glass-themed-strong flex items-center justify-center">
                                                            <Bot className="h-3.5 w-3.5 text-themed-primary" />
                                                        </div>
                                                        <span className="text-xs font-medium text-themed-tertiary">Travel AI</span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 rounded-md hover:bg-white/10"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(msg.content);
                                                            toast({ description: "Copied to clipboard!" });
                                                        }}
                                                    >
                                                        <Copy className="h-3.5 w-3.5 text-themed-tertiary" />
                                                    </Button>
                                                </div>
                                            )}
                                            <div
                                                className={`rounded-2xl px-4 py-3 ${msg.role === "user"
                                                    ? "bg-zinc-800/50 text-white rounded-tr-md"
                                                    : "glass-themed text-themed-primary rounded-tl-md"
                                                    }`}
                                            >
                                                {msg.role === "user" ? (
                                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                                ) : (
                                                    <div className="text-sm leading-[1.8] text-zinc-800 dark:text-zinc-200 prose prose-sm dark:prose-invert max-w-none space-y-4 prose-headings:font-bold prose-headings:text-zinc-900 dark:prose-headings:text-white prose-p:my-2 prose-ul:list-disc prose-ul:pl-5 prose-ul:my-2 prose-ol:list-decimal prose-ol:pl-5 prose-ol:my-2 prose-li:my-1">
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
                                            <span className="text-xs font-medium text-themed-tertiary">Travel AI</span>
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
                    <div ref={messagesEndRef} />
                </div>
            </motion.div>

            {/* Input Area */}
            <motion.div
                className={`absolute bottom-0 left-0 right-0 z-10 pb-4 pt-12 pointer-events-none flex justify-center ${compact ? 'px-1' : 'px-2 sm:px-4'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                <div className="w-full max-w-4xl pointer-events-auto backdrop-blur-xl bg-zinc-100/80 border border-zinc-200 dark:bg-zinc-900/80 dark:border-zinc-800 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-[2rem] p-2 sm:p-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Button
                            onClick={clearChat}
                            disabled={messages.length === 0 || loading}
                            size="icon"
                            className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-2xl bg-zinc-200 hover:bg-zinc-300 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 transition-all border border-white/5 hover:border-white/10 disabled:opacity-30 disabled:pointer-events-none"
                        >
                            <Trash2 className="h-5 w-5" />
                        </Button>

                        <Textarea
                            ref={textareaRef}
                            placeholder="Ask anything..."
                            className="flex-1 min-h-[50px] sm:min-h-[60px] max-h-32 resize-none rounded-2xl bg-white text-zinc-900 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 text-sm overflow-y-auto dark-scrollbar py-3 sm:py-4 px-4 focus-visible:ring-1 focus-visible:ring-zinc-500 focus-visible:ring-offset-0 transition-shadow"
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = `${e.target.scrollHeight}px`;
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            disabled={loading}
                            rows={1}
                        />

                        <Button
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || loading}
                            size="icon"
                            className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-2xl bg-zinc-200 hover:bg-zinc-300 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 transition-all border border-white/10 hover:border-white/20"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        </Button>
                    </div>
                    {!compact && (
                        <div className="flex justify-center mt-2 pb-1 group">
                            <p className="text-[10px] text-themed-quaternary hidden sm:block transition-colors group-hover:text-themed-tertiary">
                                Press <kbd className="px-1.5 py-0.5 rounded glass-themed-subtle border border-white/10 mx-1">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded glass-themed-subtle border border-white/10 mx-1">Shift + Enter</kbd> for new line
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ChatInterface;
