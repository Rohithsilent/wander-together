import { useState, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Bot, X, MessageSquare } from "lucide-react";
import ChatInterface from "./ChatInterface";
import { Button } from "@/components/ui/button";

const FloatingAI = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLeft, setIsLeft] = useState(false);
    const constraintsRef = useRef(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const dragStartPosRef = useRef({ x: 0, y: 0 });
    const controls = useAnimation();

    // Improved simplified snap handler utilizing window width
    const onDragEnd = (event: any, info: any) => {
        const r = buttonRef.current?.getBoundingClientRect();
        if (!r) return;

        const screenW = window.innerWidth;
        const centerX = r.left + r.width / 2;

        if (centerX > screenW / 2) {
            // Snap to Right
            setIsLeft(false);
            controls.start({ x: 0, transition: { type: "spring", stiffness: 400, damping: 25 } });
        } else {
            // Snap to Left
            setIsLeft(true);
            const travel = -(screenW - 32 - 32 - 56);
            controls.start({ x: travel, transition: { type: "spring", stiffness: 400, damping: 25 } });
        }
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        const deltaX = Math.abs(e.clientX - dragStartPosRef.current.x);
        const deltaY = Math.abs(e.clientY - dragStartPosRef.current.y);

        // If moved less than 5px, consider it a click
        if (deltaX < 5 && deltaY < 5) {
            setIsOpen((prev) => !prev);
        }
    };

    return (
        <>
            {/* Constraints container - covers the whole screen but allows clicks through */}
            <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden" />

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={`fixed bottom-24 z-[9999] w-[90vw] sm:w-[400px] h-[60vh] sm:h-[600px] max-h-[80vh] shadow-2xl rounded-3xl overflow-hidden glass-themed border border-themed backdrop-blur-3xl ${isLeft ? "left-4 sm:left-8" : "right-4 sm:right-8"
                            }`}
                    >
                        <div className="flex flex-col h-full bg-black/10 dark:bg-black/40">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-themed bg-white/5 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg glass-themed-strong flex items-center justify-center">
                                        <Bot className="h-5 w-5 text-themed-primary" />
                                    </div>
                                    <span className="font-light text-lg text-themed-primary tracking-wide">Wander AI</span>
                                </div>
                                <Button
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="h-8 w-8 rounded-full hover:bg-white/10 text-themed-secondary"
                                    variant="ghost"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-hidden p-2">
                                <ChatInterface className="h-full" compact={true} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Draggable FAB */}
            <motion.div
                ref={buttonRef}
                drag
                dragConstraints={constraintsRef}
                dragMomentum={false}
                animate={controls}
                onDragEnd={onDragEnd}
                whileDrag={{ scale: 1.1, cursor: "grabbing" }}
                whileTap={{ scale: 0.9 }}
                className="fixed z-[9999] pointer-events-auto cursor-grab touch-none"
                style={{ bottom: "2rem", right: "2rem" }}
            >
                <Button
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    size="icon"
                    className={`h-14 w-14 rounded-full shadow-lg border border-themed transition-all duration-300 ${isOpen
                        ? "glass-themed-strong text-themed-primary rotate-90 hover:bg-white/10"
                        : "glass-themed-strong text-themed-primary hover:text-white hover:bg-white/10 hover:scale-105"
                        }`}
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-8 w-8" />}
                </Button>
            </motion.div>
        </>
    );
};

export default FloatingAI;
