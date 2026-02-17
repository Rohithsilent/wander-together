import { useTransform, motion, MotionValue } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SequenceCanvas from './SequenceCanvas';
import OverlayContent from './OverlayContent';
import { useImagePreloader } from '@/hooks/useImagePreloader';

const BeachSection = () => {
    const { images, loaded } = useImagePreloader('/sequences/seq2', 120);

    const overlayItems = [
        { text: 'BEYOND THE HORIZON', showAt: 0.10, hideAt: 0.35 },
        { text: 'DESTINATION: UNKNOWN', showAt: 0.45, hideAt: 0.72 },
    ];

    if (!loaded) return null;

    return (
        <SequenceCanvas images={images} sectionHeight="h-[400vh]">
            {(scrollProgress: MotionValue<number>) => (
                <BeachOverlays scrollProgress={scrollProgress} overlayItems={overlayItems} />
            )}
        </SequenceCanvas>
    );
};

// Separate component so hooks work at the right level
const BeachOverlays = ({
    scrollProgress,
    overlayItems,
}: {
    scrollProgress: MotionValue<number>;
    overlayItems: { text: string; showAt: number; hideAt: number }[];
}) => {
    // CTA appears at 78% and STAYS visible at 100%
    const ctaOpacity = useTransform(scrollProgress, [0.75, 0.85, 1.0], [0, 1, 1]);
    const ctaY = useTransform(scrollProgress, [0.75, 0.85, 1.0], [60, 0, 0]);

    return (
        <>
            {/* Dark gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 pointer-events-none" />
            <OverlayContent scrollProgress={scrollProgress} items={overlayItems} />

            {/* CTA at the end — stays visible */}
            <motion.div
                style={{ opacity: ctaOpacity, y: ctaY }}
                className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none"
            >
                <h2 className="hero-text text-center mb-8 px-4">JOIN THE JOURNEY</h2>
                <Link to="/signup" className="pointer-events-auto">
                    <button className="group flex items-center gap-3 px-10 py-4 text-lg font-semibold uppercase tracking-wider text-white border border-white/20 rounded-full backdrop-blur-xl bg-white/10 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:border-white/40">
                        Get Started
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                </Link>
            </motion.div>
        </>
    );
};

export default BeachSection;
