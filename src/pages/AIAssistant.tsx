import Navbar from "@/components/Navbar";
import ChatInterface from "@/components/ai/ChatInterface";
import { motion } from "framer-motion";

const AIAssistant = () => {
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
          <ChatInterface />
        </div>
      </main>
    </motion.div>
  );
};

export default AIAssistant;
