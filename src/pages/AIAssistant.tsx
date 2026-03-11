import Navbar from "@/components/Navbar";
import ChatInterface from "@/components/ai/ChatInterface";
import { motion } from "framer-motion";

const AIAssistant = () => {
  return (
    <motion.div
      className="h-[100dvh] app-background-themed flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar />

      <main className="flex-1 pt-20 pb-0 overflow-hidden relative">
        <div className="container mx-auto px-2 sm:px-4 h-full max-w-6xl flex flex-col">
          <ChatInterface />
        </div>
      </main>
    </motion.div>
  );
};

export default AIAssistant;
