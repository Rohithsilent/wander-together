import { useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import SequenceCanvas from './SequenceCanvas';
import OverlayContent from './OverlayContent';
import { useImagePreloader } from '@/hooks/useImagePreloader';

const HeroSection = () => {
    const sectionRef = useRef<HTMLDivElement>(null);

    const { images, loaded } = useImagePreloader('/sequences/seq1', 120);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start start', 'end end'],
    });

    // Use raw scrollY (pixels) for entry text fade — completely reliable
    const { scrollY } = useScroll();
    const entryOpacity = useTransform(scrollY, [0, 150], [1, 0]);
    const entryY = useTransform(scrollY, [0, 150], [0, -80]);

    const overlayItems = [
        { text: 'THE ART OF DEPARTURE', showAt: 0.10, hideAt: 0.25 },
        { text: 'TRAVEL BUDDY', showAt: 0.28, hideAt: 0.50 },
        { text: 'ELEVATED ADVENTURES FOR THE MODERN TRIBE', showAt: 0.53, hideAt: 0.78 },
    ];

    if (!loaded) return null;

    return (
        <section ref={sectionRef}>
            <SequenceCanvas images={images} sectionHeight="h-[400vh]">
                {/* Dark gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 pointer-events-none" />

                {/* ── Entry Text (fades out after 150px scroll) ── */}
                <motion.div
                    style={{ opacity: entryOpacity, y: entryY }}
                    className="absolute inset-0 flex flex-col justify-between pointer-events-none pt-24 pb-10 px-6 md:px-12 lg:px-20 z-20"
                >
                    {/* Top headlines */}
                    <div className="flex justify-between items-start">
                        <motion.h1
                            className="text-white font-extralight leading-[0.95] tracking-tighter"
                            style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                        >
                            We are<br />
                            <span className="font-light">movement</span>
                        </motion.h1>

                        <motion.h2
                            className="hidden md:block text-white font-extralight text-right leading-[0.95] tracking-tighter"
                            style={{ fontSize: 'clamp(2rem, 5vw, 5rem)' }}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                        >
                            We are<br />
                            <span className="font-light">distinction</span>
                        </motion.h2>
                    </div>

                    {/* Center brand */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
                    >
                        <h2
                            className="text-white font-light tracking-[0.15em] italic"
                            style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}
                        >
                            Travel Buddy
                        </h2>
                    </motion.div>

                    {/* Bottom row */}
                    <div className="relative flex justify-between items-end">
                        <motion.div
                            className="max-w-xs"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
                        >
                            <h3 className="text-white font-semibold text-lg md:text-2xl leading-tight mb-3">
                                Your freedom to<br />explore the world
                            </h3>
                            <p className="text-white/60 text-xs md:text-sm leading-relaxed max-w-[240px]">
                                Every journey is designed around your curiosity,
                                time, and ambitions — so you can focus on what
                                truly matters.
                            </p>
                        </motion.div>

                        {/* Centered "Start Journey" button */}
                        {/* <motion.div
                            className="absolute left-1/2 -translate-x-1/2 bottom-0 hidden md:flex flex-col items-center gap-2 pointer-events-auto"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 1.2 }}
                        >
                            <Link to="/signup">
                                <button className="flex items-center gap-3 px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white border border-white/20 rounded-full backdrop-blur-xl bg-white/5 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:border-white/40">
                                    Start Journey
                                </button>
                            </Link>
                        </motion.div> */}

                        <motion.div
                            className="flex items-center gap-3 text-white/60"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 1.0 }}
                        >
                            <ChevronDown className="h-4 w-4 animate-bounce" />
                            <span className="text-xs uppercase tracking-[0.3em]">Scroll Down</span>
                            <span className="hidden md:inline text-xs uppercase tracking-[0.3em] ml-6">Start The Journey</span>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Scroll-linked overlays (appear after entry text is gone) */}
                <OverlayContent scrollProgress={scrollYProgress} items={overlayItems} />
            </SequenceCanvas>
        </section>
    );
};

export default HeroSection;
